using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class Item
    {
        public int ItemID { get; set; }
        public string ItemType { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public decimal Need { get; set; }
        public decimal ActualAmount { get; set; }
        public int GoalAmount { get; set; }
    }
}
