using Microsoft.Extensions.Configuration;
using Nancy.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using ZT.Core.Models.Payment;
using ZT.Data;

namespace ZT.Services
{
    public interface IPaymentService
    {
        Result<MPESAPayment> ResendMPESAPayment(int userID, int paymentID, decimal total, string phoneNumber, bool isKES);
        Result<MPESAPayment> MakeMPESAPayment(int userID, decimal total, string phoneNumber, bool isKES);
        MPESAValidationResponse ValidateMPESAPayment(MPESAValidation validation);
        Result<string> CheckPaymentStatus(int paymentID);
        Result<PaymentDetails> LoadPaymentDetails(int paymentID);
    }
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly IEncryptionService _encryptionService;
        private readonly ILanguageAndCurrencyAccessor _currencyAccessor;
        private readonly IPaymentAccessor _paymentAccessor;
        private readonly IDonateAccessor _donateAccessor;
        private readonly IEmailService _emailService;
        private readonly IAccountAccessor _accountAccessor;

        private readonly string _paymentTemplate = "\"BusinessShortCode\": \"{0}\"," +
              "\"Password\": \"{1}\"," +
              "\"Timestamp\": \"{2}\"," +
              "\"TransactionType\": \"CustomerPayBillOnline\"," +
              "\"Amount\": \"{3}\"," +
              "\"PartyA\": \"{4}\"," +
              "\"PartyB\": \"{5}\"," +
              "\"PhoneNumber\": \"{6}\"," +
              "\"CallBackURL\": \"{7}\"," +
              "\"AccountReference\": \" {8}\"," +
              "\"TransactionDesc\": \"{9}\"";

        private static int _accountRef = 1;

        public PaymentService(IConfiguration configuration,
                                IEncryptionService encryptionService,
                                ILanguageAndCurrencyAccessor currencyAccessor,
                                IPaymentAccessor paymentAccessor,
                                IDonateAccessor donateAccessor,
                                IEmailService emailService,
                                IAccountAccessor accountAccessor)
        {
            _configuration = configuration;
            _encryptionService = encryptionService;
            _currencyAccessor = currencyAccessor;
            _paymentAccessor = paymentAccessor;
            _donateAccessor = donateAccessor;
            _emailService = emailService;
            _accountAccessor = accountAccessor;
        }

        public Result<MPESAPayment> ResendMPESAPayment(int userID, int paymentID, decimal total, string phoneNumber, bool isKES)
        {
            var timestamp = DateTime.Now.ToString("yyyyMMddhhmmss");

            var mpesa = _configuration.GetSection("MPESA");
            int amount;
            decimal donationAmount;
            if (isKES)
            {
                amount = (int)total;
                var currency = _currencyAccessor.GetCurrencyByCode("KES").Payload;
                donationAmount = total / currency.ConversionRateFromUSD;
            }
            else
            {
                var currency = _currencyAccessor.GetCurrencyByCode("KES").Payload;
                amount = (int)Round(total * currency.ConversionRateFromUSD, currency.RoundDigits);
                donationAmount = total;
            }
            var payment = new MPESAPaymentRequest
            {
                BusinessShortCode = mpesa["SandboxShortCode"],
                Password = _encryptionService.GenerateMPESAPassword(mpesa["SandboxShortCode"], mpesa["SandboxPassKey"], timestamp),
                Timestamp = timestamp,
                //For testing
                Amount = 1,
                PartyA = phoneNumber,
                PartyB = mpesa["SandboxShortCode"],
                PhoneNumber = phoneNumber,
                CallBackURL = mpesa["SandboxCallBackURL"],
                AccountReference = CalcAccountReference(),
                TransactionDesc = "CYEC Donation"
            };

            try
            {
                //GetAuthCode
                var authRequest = (HttpWebRequest)WebRequest.Create(mpesa["SandboxOAuthURL"]);
                authRequest.ContentType = "application/json";

                var authKey = "Basic " + Convert.ToBase64String((mpesa["SandboxConsumerKey"] + ":" + mpesa["SandboxConsumerSecret"]).Select(x => (byte)x).ToArray());
                authRequest.Headers.Add("Authorization", authKey);
                authRequest.Headers.Add("cache-control", "no-cache");
                authRequest.Method = "GET";

                var authResponse = (HttpWebResponse)authRequest.GetResponse();
                var result = "";
                using (var streamReader = new StreamReader(authResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }

                var responseJSON = JsonConvert.DeserializeObject<JObject>(result);
                var authToken = responseJSON["access_token"].ToString();

                //Send payment request
                var paymentRequest = (HttpWebRequest)WebRequest.Create(mpesa["SandboxURL"]);

                paymentRequest.ContentType = "application/json";
                paymentRequest.Accept = "*/*";
                paymentRequest.KeepAlive = true;
                paymentRequest.Headers.Add("Authorization", "Bearer " + authToken);
                paymentRequest.Method = "POST";

                using (var streamWriter = new StreamWriter(paymentRequest.GetRequestStream()))
                {
                    string json = string.Format(_paymentTemplate, payment.BusinessShortCode, payment.Password, payment.Timestamp, payment.Amount, payment.PartyA,
                                                payment.PartyB, payment.PhoneNumber, payment.CallBackURL, payment.AccountReference, payment.TransactionDesc);
                    json = "{" + json + "}";

                    streamWriter.Write(json);
                }

                var paymentResponse = (HttpWebResponse)paymentRequest.GetResponse();
                result = "";
                using (var streamReader = new StreamReader(paymentResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }

                responseJSON = JsonConvert.DeserializeObject<JObject>(result);
                var response = new MPESAPaymentResponse
                {
                    MerchantRequestID = responseJSON["MerchantRequestID"].ToString(),
                    CheckoutRequestID = responseJSON["CheckoutRequestID"].ToString(),
                    ResponseCode = responseJSON["ResponseCode"].ToString(),
                    ResponseDescription = responseJSON["ResponseDescription"].ToString(),
                    CustomerMessage = responseJSON["CustomerMessage"].ToString(),
                };

                if (response.ResponseCode != "0")
                {
                    return new Result<MPESAPayment>(false, "Error initiating transaction.");
                }

                var mpesaPayment = _paymentAccessor.GetAndUpdatePayment(paymentID).Payload;

                SendPaymentConfirmationEmail(userID, mpesaPayment.MPESAPaymentID);

                return new Result<MPESAPayment>(mpesaPayment);
            }
            catch (Exception ex)
            {
                return new Result<MPESAPayment>(false, "An error occurred while sending the payment: " + ex.Message);
            }
        }

        public Result<MPESAPayment> MakeMPESAPayment(int userID, decimal total, string phoneNumber, bool isKES)
        {
            var timestamp = DateTime.Now.ToString("yyyyMMddhhmmss");

            var mpesa = _configuration.GetSection("MPESA");
            int amount;
            if (isKES)
            {
                amount = (int)total;
            }
            else
            {
                var currency = _currencyAccessor.GetCurrencyByCode("KES").Payload;
                amount = (int)Round(total * currency.ConversionRateFromUSD, currency.RoundDigits);
            }
            var payment = new MPESAPaymentRequest
            {
                BusinessShortCode = mpesa["SandboxShortCode"],
                Password = _encryptionService.GenerateMPESAPassword(mpesa["SandboxShortCode"], mpesa["SandboxPassKey"], timestamp),
                Timestamp = timestamp,
                //For testing
                Amount = 1,
                PartyA = phoneNumber,
                PartyB = mpesa["SandboxShortCode"],
                PhoneNumber = phoneNumber,
                CallBackURL = mpesa["SandboxCallBackURL"],
                AccountReference = CalcAccountReference(),
                TransactionDesc = "CYEC Donation"
            };

            try
            {
                //GetAuthCode
                var authRequest = (HttpWebRequest)WebRequest.Create(mpesa["SandboxOAuthURL"]);
                authRequest.ContentType = "application/json";

                var authKey = "Basic " + Convert.ToBase64String((mpesa["SandboxConsumerKey"] + ":" + mpesa["SandboxConsumerSecret"]).Select(x => (byte)x).ToArray());
                authRequest.Headers.Add("Authorization", authKey);
                authRequest.Headers.Add("cache-control", "no-cache");
                authRequest.Method = "GET";

                var authResponse = (HttpWebResponse)authRequest.GetResponse();
                var result = "";
                using (var streamReader = new StreamReader(authResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }

                var responseJSON = JsonConvert.DeserializeObject<JObject>(result);
                var authToken = responseJSON["access_token"].ToString();

                //Send payment request
                var paymentRequest = (HttpWebRequest)WebRequest.Create(mpesa["SandboxURL"]);

                paymentRequest.ContentType = "application/json";
                paymentRequest.Accept = "*/*";
                paymentRequest.KeepAlive = true;
                paymentRequest.Headers.Add("Authorization", "Bearer " + authToken);
                paymentRequest.Method = "POST";

                using (var streamWriter = new StreamWriter(paymentRequest.GetRequestStream()))
                {
                    string json = string.Format(_paymentTemplate, payment.BusinessShortCode, payment.Password, payment.Timestamp, payment.Amount, payment.PartyA,
                                                payment.PartyB, payment.PhoneNumber, payment.CallBackURL, payment.AccountReference, payment.TransactionDesc);
                    json = "{" + json + "}";

                    streamWriter.Write(json);
                }

                var paymentResponse = (HttpWebResponse)paymentRequest.GetResponse();
                result = "";
                using (var streamReader = new StreamReader(paymentResponse.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }

                responseJSON = JsonConvert.DeserializeObject<JObject>(result);
                var response = new MPESAPaymentResponse
                {
                    MerchantRequestID = responseJSON["MerchantRequestID"].ToString(),
                    CheckoutRequestID = responseJSON["CheckoutRequestID"].ToString(),
                    ResponseCode = responseJSON["ResponseCode"].ToString(),
                    ResponseDescription = responseJSON["ResponseDescription"].ToString(),
                    CustomerMessage = responseJSON["CustomerMessage"].ToString(),
                };

                if (response.ResponseCode != "0")
                {
                    return new Result<MPESAPayment>(false, "Error initiating transaction.");
                }

                var donation = _donateAccessor.MakeDonation(userID, amount, "mpesa", "KES").Payload;

                var mpesaPayment = new MPESAPayment
                {
                    DonationID = donation.DonationID,
                    MerchantRequestID = response.MerchantRequestID,
                    CheckoutRequestID = response.CheckoutRequestID,
                    AccountReference = payment.AccountReference,
                    PaymentStatus = "Pending",
                    PhoneNumber = phoneNumber
                };
                _paymentAccessor.AddMPESAPayment(mpesaPayment);

                var cartItems = _donateAccessor.GetCartItems(userID, "KES").Payload;
                var items = cartItems.Select(x => new DonationItem
                {
                    DonationID = donation.DonationID,
                    ItemID = x.ItemID,
                    TotalAmount = x.TotalAmount,
                    NumberOfItems = x.NumItems,
                    CurrencyID = x.CurrencyID
                }).ToList();

                _donateAccessor.AddDonationItems(items);

                SendPaymentConfirmationEmail(userID, mpesaPayment.MPESAPaymentID);

                return new Result<MPESAPayment>(mpesaPayment);
            }
            catch (Exception ex)
            {
                return new Result<MPESAPayment>(false, "An error occurred while sending the payment: " + ex.Message);
            }
        }

        private string CalcAccountReference()
        {
            var numStr = _accountRef.ToString();
            var pad = 12 - numStr.Length;
            var result = numStr.PadLeft(pad, '0');
            _accountRef++;
            return result;
        }

        private decimal Round(decimal price, int roundDigits)
        {
            if (roundDigits < 0)
            {
                var alteredPrice = price * (decimal)Math.Pow(10, roundDigits);
                alteredPrice = Math.Ceiling(alteredPrice);
                alteredPrice *= (decimal)Math.Pow(10, roundDigits * -1);
                return alteredPrice;
            }
            else if (roundDigits == 0)
            {
                return Math.Ceiling(price);
            }
            else
            {
                return Math.Round(price, roundDigits);
            }
        }

        public MPESAValidationResponse ValidateMPESAPayment(MPESAValidation validation)
        {
            var validationResult = _paymentAccessor.ValidateMPESAPayment(validation.MerchantRequestID, validation.CheckoutRequestID, validation.ResultCode);
            if (validationResult.IsSuccess)
            {
                var donationID = validationResult.Payload.Item1;
                var userID = validationResult.Payload.Item2;
                if (validation.ResultCode == "0")
                {
                    _donateAccessor.UpdateDonationStatus(donationID, 6);
                    _donateAccessor.ClearUserCart(userID);
                    SendPaymentConfirmationEmail(userID, donationID);
                }
                else
                {
                    _donateAccessor.UpdateDonationStatus(donationID, 4);
                }
                return new MPESAValidationResponse
                {
                    ResponseCode = "00000000",
                    ResponseDesc = "Success"
                };
            }
            else
            {
                return new MPESAValidationResponse
                {
                    ResponseCode = "99999999",
                    ResponseDesc = "Failure"
                };
            }
        }

        private async void SendPaymentConfirmationEmail(int userID, int paymentID)
        {
            var email = _accountAccessor.FindUser(userID).Payload.Email;
            var items = _paymentAccessor.GetDonationItems(paymentID);
            var itemNames = _donateAccessor.GetItemNames(items);

            var details = LoadPaymentDetails(paymentID).Payload;
            await System.Threading.Tasks.Task.Run(() => _emailService.SendPaymentConfirmationEmail(email, items, itemNames, details));
        }

        public Result<string> CheckPaymentStatus(int paymentID)
        {
            return _paymentAccessor.CheckPaymentStatus(paymentID);
        }

        public Result<PaymentDetails> LoadPaymentDetails(int paymentID)
        {
            var shortCode = _configuration.GetSection("MPESA")["SandboxShortCode"];
            var details = _paymentAccessor.LoadPaymentDetails(paymentID, shortCode);
            return new Result<PaymentDetails>(details);
        }
    }
}
