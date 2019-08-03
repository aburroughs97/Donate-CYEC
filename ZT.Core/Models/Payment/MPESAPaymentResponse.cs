using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Payment
{
    public class MPESAPaymentResponse
    {
        public string MerchantRequestID { get; set; }
        public string CheckoutRequestID { get; set; }
        public string ResponseCode { get; set; }
        public string ResponseDescription { get; set; }
        public string CustomerMessage { get; set; }
    }
}
