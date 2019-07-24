using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class Donation
    {
        public int DonationID { get; set; }
        public int UserID { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Date { get; set; }
        public string DonationType { get; set; }
        public int StatusID { get; set; }
    }
}
