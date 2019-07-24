using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DropOffDonation
    {
        public int DropOffDonationID { get; set; }
        public int DonationID { get; set; }
        public DateTime DeliveryDate { get; set; }
    }
}
