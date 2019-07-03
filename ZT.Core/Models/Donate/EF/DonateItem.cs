using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonateItem
    {
        public int ItemID { get; set; }
        public string ItemType { get; set; }
        public decimal Price { get; set; }
        public decimal Need { get; set; }
        public string ImagePath { get; set; }
        public bool IsDeleted { get; set; }
    }
}
