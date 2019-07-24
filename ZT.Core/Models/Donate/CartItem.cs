using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class CartItem
    {
        public int CartItemID { get; set; }
        public int ItemID { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public decimal TotalAmount { get; set; }
        public int? NumItems { get; set; }
        public decimal Need { get; set; }
    }
}
