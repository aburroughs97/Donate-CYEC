using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Inventory;

namespace ZT.Data
{
    public interface IInventoryAccessor
    {
        Result AddInventoryItem(InventoryItem item);
        Result RemoveInventoryItem(int itemID);
        Result UpdateInventoryItem(InventoryItem item);
        Result<InventoryItem> GetItem(int itemID);
        Result<List<InventoryItem>> GetActiveInventoryItems();
        Result UpdateInventoryItemRange(List<InventoryItem> items);
        Result<List<InventoryItem>> GetInventoryItemRange(IEnumerable<int> items);
    }
    public class InventoryAccessor : IInventoryAccessor
    {

        private readonly DBContext _dbContext;

        public InventoryAccessor(DBContext dBContext)
        {
            _dbContext = dBContext;
        }

        public Result AddInventoryItem(InventoryItem item)
        {
            try
            {
                _dbContext.InventoryItem.Add(item);
                _dbContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<InventoryItem>> GetActiveInventoryItems()
        {
            try
            {
                var list = _dbContext.InventoryItem.Where(x => !x.IsDeleted).ToList();
                return new Result<List<InventoryItem>>(list);
            }
            catch(Exception ex)
            {
                return new Result<List<InventoryItem>>(false, ex.Message);
            }
        }

        public Result<List<InventoryItem>> GetInventoryItemRange(IEnumerable<int> itemIDs)
        {
            var list = _dbContext.InventoryItem.Where(x => itemIDs.Contains(x.ItemID)).ToList();
            return new Result<List<InventoryItem>>(list);
        }

        public Result<InventoryItem> GetItem(int itemID)
        {
            var item = (from x in _dbContext.InventoryItem where x.ItemID == itemID select x).FirstOrDefault();
            return new Result<InventoryItem>(item);
        }

        public Result RemoveInventoryItem(int itemID)
        {
            try
            {
                var item = (from x in _dbContext.InventoryItem where x.InventoryItemID == itemID select x).First();
                _dbContext.InventoryItem.Remove(item);
                _dbContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result UpdateInventoryItem(InventoryItem item)
        {
            try
            {
                _dbContext.InventoryItem.Update(item);
                _dbContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result UpdateInventoryItemRange(List<InventoryItem> items)
        {
            try
            {
                _dbContext.InventoryItem.UpdateRange(items);
                _dbContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }
    }
}
