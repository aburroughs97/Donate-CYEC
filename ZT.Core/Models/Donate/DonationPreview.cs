using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonationPreview
    {
        public int DonationID { get; set; }
        public string Name { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}
