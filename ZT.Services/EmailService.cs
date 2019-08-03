using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Mail;
using System.Text;
using ZT.Core.Models.Donate;
using ZT.Core.Models.Payment;

namespace ZT.Services
{
    public interface IEmailService
    {
        void SendPasswordResetEmail(string email, string resetCode);
        void SendDropOffDonationConfirmationEmail(string email, List<DonationItem> items, List<string> itemNames, string delivery);
        void SendPaymentConfirmationEmail(string email, List<DonationItem> items, List<string> itemNames, PaymentDetails details);
    }
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string _passwordResetEmailTemplate = "<p>You are receiving this email because a password reset was requested. If you did not request a password reset, you can safely ignore this email.</p>" +
                                                     "<p>Copy-and-paste the following code to reset your password </p> " +
                                                     "<p><b>{0}</b></p>" +
                                                     "<hr />" +
                                                     "<h4>Donate-CYEC</h4>";

        private string _donationItemTemplate = "<p style=\"Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;\">{0}{1} - {2:C}</p>";

        private void SendEmail(string email, string subject, string body)
        {
            try
            {
                SmtpClient SmtpServer = new SmtpClient("smtp.dreamhost.com");

                MailMessage mail = new MailMessage
                {
                    From = new MailAddress(_configuration["EmailSender"]),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mail.To.Add(email);

                SmtpServer.Port = 587;
                SmtpServer.EnableSsl = true;
                SmtpServer.Credentials = new System.Net.NetworkCredential(_configuration["EmailSender"], _configuration["EmailAuth"]);

                SmtpServer.Send(mail);
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public void SendPasswordResetEmail(string email, string resetCode)
        {
            var body = string.Format(_passwordResetEmailTemplate, resetCode);
            SendEmail(email, "Password Reset", body);
            
        }

        public void SendDropOffDonationConfirmationEmail(string email, List<DonationItem> items, List<string> itemNames, string delivery)
        {
            var dir = Directory.GetParent(Environment.CurrentDirectory) + "\\Ziwadi Trade Prototype\\ClientApp\\src\\media\\EmailTemplates\\DropOff.html";
            var template = File.ReadAllText(dir);

            var splitIndex = template.IndexOf("{0}");
            var firstHalf = template.Substring(0, splitIndex);
            var secondHalf = template.Substring(splitIndex);
            var itemsStr = "";
            for(int i = 0; i < items.Count; i++)
            {
                var numItemsStr = items[i].NumberOfItems != null ? items[i].NumberOfItems + " x " : "";
                itemsStr += string.Format(_donationItemTemplate, numItemsStr, itemNames[i], items[i].TotalAmount);
            }

            secondHalf = string.Format(secondHalf, itemsStr, delivery);
            SendEmail(email, "Thank You For Your Donation", firstHalf + secondHalf);
        }

        public void SendPaymentConfirmationEmail(string email, List<DonationItem> items, List<string> itemNames, PaymentDetails details)
        {
            var dir = Directory.GetParent(Environment.CurrentDirectory) + "\\Ziwadi Trade Prototype\\ClientApp\\src\\media\\EmailTemplates\\Payment.html";
            var template = File.ReadAllText(dir);

            var splitIndex = template.IndexOf("{6}");
            var firstHalf = template.Substring(0, splitIndex);
            var secondHalf = template.Substring(splitIndex);
            var itemsStr = "";
            for (int i = 0; i < items.Count; i++)
            {
                var numItemsStr = items[i].NumberOfItems != null ? items[i].NumberOfItems + " x " : "";
                itemsStr += string.Format(_donationItemTemplate, numItemsStr, itemNames[i], items[i].TotalAmount);
            }

            secondHalf = string.Format(secondHalf, details.ConfirmationNumber, details.PaymentMethod, details.Paybill, details.PhoneNumber, details.Amount, details.PaymentDate, itemsStr);
            SendEmail(email, "Thank You For Your Donation", firstHalf + secondHalf);
        }
    }
}
