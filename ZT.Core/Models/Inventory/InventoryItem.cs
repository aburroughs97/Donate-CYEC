using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Inventory
{
    public class InventoryItem
    {
        public int InventoryItemID { get; set; }
        public int ItemID { get; set; }
        public decimal ActualAmount { get; set; }
        public int GoalAmount { get; set; }
        public bool AutoDecrement { get; set; }
        public decimal? DecrementPerDay { get; set; }
        public bool IsDeleted { get; set; }
    }
}
