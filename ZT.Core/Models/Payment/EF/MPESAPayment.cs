using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Payment
{
    public class MPESAPayment
    {
        public int MPESAPaymentID { get; set; }
        public int DonationID { get; set; }
        public string PhoneNumber { get; set; }
        public string MerchantRequestID { get; set; }
        public string CheckoutRequestID { get; set; }
        public string AccountReference { get; set; }
        public string PaymentStatus { get; set; }
    }
}
