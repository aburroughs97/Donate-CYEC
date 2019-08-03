using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Payment
{
    public class MPESAValidation
    {
        public string MerchantRequestID { get; set; }
        public string CheckoutRequestID { get; set; }
        public string ResultDesc { get; set; }
        public string ResultCode { get; set; }
    }
}
