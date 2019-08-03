using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonationItem
    {
        public int DonationItemID { get; set; }
        public int DonationID { get; set; }
        public int ItemID { get; set; }
        public decimal TotalAmount { get; set; }
        public int? NumberOfItems { get; set; }
        public int CurrencyID { get; set; }
    }
}
