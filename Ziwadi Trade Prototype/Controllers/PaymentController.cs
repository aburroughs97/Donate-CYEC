using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ZT.Core.Models.Payment;
using ZT.Services;

namespace ZT.Controllers
{
    [Route("api/Payments")]
    public class PaymentController : Controller
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("MPESA/Send")]
        public IActionResult SendMPESA(int userID, decimal amount, string phoneNumber, bool isKES)
        {
            var result = _paymentService.MakeMPESAPayment(userID, amount, phoneNumber, isKES);
            return Json(result);
        }


        [HttpGet("MPESA/Resend")]
        public IActionResult ResendMPESA(int userID, int paymentID, decimal amount, string phoneNumber, bool isKES)
        {
            var result = _paymentService.ResendMPESAPayment(userID, paymentID, amount, phoneNumber, isKES);
            return Json(result);
        }



        [HttpPost("MPESA/Validate")]
        public IActionResult ValidateMPESA()
        {
            var bodyStream = new StreamReader(HttpContext.Request.Body);
            var bodyText = bodyStream.ReadToEnd();

            var obj = JsonConvert.DeserializeObject<JObject>(bodyText);
            var callback = obj["Body"]["stkCallback"] as JObject;

            var validation = new MPESAValidation
            {
                MerchantRequestID = callback["MerchantRequestID"].ToString(),
                CheckoutRequestID = callback["CheckoutRequestID"].ToString(),
                ResultDesc = callback["ResultDesc"].ToString(),
                ResultCode = callback["ResultCode"].ToString()
            };

            var result = _paymentService.ValidateMPESAPayment(validation);
            return Json(result);
        }

        [HttpGet("MPESA/CheckStatus")]
        public IActionResult CheckPaymentStatus(int paymentID)
        {
            var result = _paymentService.CheckPaymentStatus(paymentID);
            return Json(result);
        }

        [HttpGet("MPESA/LoadPaymentDetails")]
        public IActionResult LoadPaymentDetails(int paymentID)
        {
            var result = _paymentService.LoadPaymentDetails(paymentID);
            return Json(result);
        }
    }
}