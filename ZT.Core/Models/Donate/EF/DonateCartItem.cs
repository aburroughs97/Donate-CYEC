using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonateCartItem
    {
        public int CartItemID { get; set; }
        public int UserID { get; set; }
        public int ItemID { get; set; }
        public decimal TotalAmount { get; set; }
        public int? NumItems { get; set; }
        public int CurrencyID { get; set; }
    }
}
