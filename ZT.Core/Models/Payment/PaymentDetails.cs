using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Payment
{
    public class PaymentDetails
    {
        public string ConfirmationNumber { get; set; }
        public string Sender { get; set; }
        public string PaymentMethod { get; set; } = "MPESA";
        public string Paybill { get; set; }
        public decimal Amount { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}
