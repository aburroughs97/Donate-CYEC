using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using ZT.Core.Models.Inventory;
using ZT.Data;

namespace ZT.Services
{
    public interface IInventoryManager
    {
        Result DecrementInventory();

    }
    public class InventoryManager : IInventoryManager
    {
        private readonly IInventoryAccessor _inventoryAccessor;
        private readonly IDonateAccessor _donateAccessor;

        public InventoryManager(IInventoryAccessor inventoryAccessor,
                                IDonateAccessor donateAccessor)
        {
            _inventoryAccessor = inventoryAccessor;
            _donateAccessor = donateAccessor;
        }

        public Result DecrementInventory()
        {
            var itemResult = _inventoryAccessor.GetActiveInventoryItems();
            if (!itemResult.IsSuccess) return new Result(false, itemResult.Message);

            var items = itemResult.Payload.Where(x => x.AutoDecrement).ToList();
            foreach(var item in items)
            {
                item.ActualAmount -= item.DecrementPerDay.Value;
                item.ActualAmount = Math.Max(item.ActualAmount, 0);
            }
            var updateResult = _inventoryAccessor.UpdateInventoryItemRange(items);
            if (!updateResult.IsSuccess) return new Result(false, updateResult.Message);

            //Update need for each item
            var donateItemsResult = _donateAccessor.GetDonateItems();
            if (!donateItemsResult.IsSuccess) return new Result(false, donateItemsResult.Message);

            var donateItems = donateItemsResult.Payload.Where(x => items.Any(y => y.ItemID == x.ItemID)).ToList();
            foreach(var ditem in donateItems)
            {
                var item = items.First(x => x.ItemID == ditem.ItemID);
                //This ensures that the number in stock only changes once an item has been fully used
                //For example: If it takes 1 week for an item to be fully used, it will decrement by roughly .013 each day
                //             meaning that the number used for calculating need won't update until 7 days have passed.
                var newNeed = Math.Min(Math.Ceiling(item.ActualAmount) / item.GoalAmount, 1);
                ditem.Need = Math.Round(newNeed, 2);
            }
            return _donateAccessor.UpdateDonateItemRange(donateItems);
        }
    }
}
