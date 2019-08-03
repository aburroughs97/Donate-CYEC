using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Admin
{
    public class DropOffDonationData
    {
        public int DonationID { get; set; }
        public string FullName { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Date { get; set; }
        public DateTime DeliveryDate { get; set; }
        public bool Delivered { get; set; }
    }
}
