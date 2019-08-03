using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Admin
{
    public class PaymentDonationData
    {
        public int DonationID { get; set; }
        public string FullName { get; set; }
        public string ItemName { get; set; }
        public int? NumberOfItems { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}
