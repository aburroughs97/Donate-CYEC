using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using Microsoft.EntityFrameworkCore;
using ZT.Core.Models.Payment;
using ZT.Core.Models.Donate;

namespace ZT.Data
{
    public interface IPaymentAccessor
    {
        Result AddMPESAPayment(MPESAPayment payment);
        Result<Tuple<int, int>> ValidateMPESAPayment(string merchantRequestID, string customerRequestID, string statusCode);
        Result<string> CheckPaymentStatus(int paymentID);
        PaymentDetails LoadPaymentDetails(int paymentID, string shortCode);
        List<DonationItem> GetDonationItems(int paymentID);
        Result<MPESAPayment> GetAndUpdatePayment(int paymentID);
    }
    public class PaymentAccessor : IPaymentAccessor
    {
        private readonly DBContext _dBContext;

        public PaymentAccessor(DBContext dbContext)
        {
            _dBContext = dbContext;
        }

        public Result AddMPESAPayment(MPESAPayment payment)
        {
            try
            {
                _dBContext.MPESAPayment.Add(payment);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<string> CheckPaymentStatus(int paymentID)
        {
            try
            {
                var status = (from x in _dBContext.MPESAPayment where x.MPESAPaymentID == paymentID select x.PaymentStatus).First();
                return new Result<string>(status);
            }
            catch (Exception ex)
            {
                return new Result<string>(false, ex.Message);
            }
        }

        public Result<Tuple<int, int>> ValidateMPESAPayment(string merchantRequestID, string customerRequestID, string statusCode)
        {
            try
            {
                var payment = (from x in _dBContext.MPESAPayment where x.MerchantRequestID == merchantRequestID && x.CheckoutRequestID == customerRequestID select x).FirstOrDefault();
                if (payment == null) return new Result<Tuple<int, int>>(false, "Payment not found");

                payment.PaymentStatus = statusCode == "0" ? "Verified" : "Rejected";
                _dBContext.MPESAPayment.Update(payment);
                _dBContext.SaveChanges();

                var userID = (from x in _dBContext.Donation
                              where x.DonationID == payment.DonationID
                              from y in _dBContext.User
                              where x.UserID == y.UserID
                              select y.UserID).First();
                return new Result<Tuple<int, int>>(new Tuple<int, int>(payment.DonationID, userID));
            }
            catch (Exception ex)
            {
                return new Result<Tuple<int, int>>(false, ex.Message);
            }
        }

        public PaymentDetails LoadPaymentDetails(int paymentID, string shortCode)
        {
            try
            {
                var details = (from x in _dBContext.MPESAPayment
                               where x.MPESAPaymentID == paymentID
                               from y in _dBContext.Donation
                               where x.DonationID == y.DonationID
                               from z in _dBContext.User
                               where y.UserID == z.UserID
                               select new PaymentDetails
                               {
                                   ConfirmationNumber = Convert.ToBase64String((x.MerchantRequestID + x.CheckoutRequestID).Select(x => (byte)x).ToArray()).Substring(0, 12),
                                   Sender = z.FirstName + " " + z.LastName,
                                   Amount = y.TotalAmount,
                                   Paybill = shortCode,
                                   PhoneNumber = x.PhoneNumber,
                                   PaymentDate = y.Date
                               }).FirstOrDefault();
                return details;
            }
            catch
            {
                return null;
            }
        }

        public List<DonationItem> GetDonationItems(int paymentID)
        {
            try
            {
                var items = (from x in _dBContext.MPESAPayment where x.MPESAPaymentID == paymentID
                             from y in _dBContext.Donation where x.DonationID == y.DonationID
                             from z in _dBContext.DonationItem where y.DonationID == z.DonationID
                             select z).ToList();
                return items;
            }
            catch
            {
                return null;
            }
        }

        public Result<MPESAPayment> GetAndUpdatePayment(int paymentID)
        {
            try
            {
                var payment = _dBContext.MPESAPayment.First(x => x.MPESAPaymentID == paymentID);
                payment.PaymentStatus = "Pending";
                _dBContext.MPESAPayment.Update(payment);
                _dBContext.SaveChanges();
                return new Result<MPESAPayment>(payment);
            }
            catch(Exception ex)
            {
                return new Result<MPESAPayment>(false, ex.Message);
            }
        }
    }
}
