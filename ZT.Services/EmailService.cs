using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Text;

namespace ZT.Services
{
    public interface IEmailService
    {
        void SendPasswordResetEmail(string email, string resetCode);
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
                                                     

        public void SendPasswordResetEmail(string email, string resetCode)
        {
            MailMessage mail = new MailMessage();
            SmtpClient SmtpServer = new SmtpClient("smtp.gmail.com");

            mail.From = new MailAddress(_configuration["EmailSender"]);
            mail.To.Add(email);
            mail.Subject = "Password Reset";
            mail.Body =  string.Format(_passwordResetEmailTemplate, resetCode);
            mail.IsBodyHtml = true;

            SmtpServer.Port = 587;
            SmtpServer.Credentials = new System.Net.NetworkCredential(_configuration["EmailSender"], _configuration["EmailAuth"]);
            SmtpServer.EnableSsl = true;

            SmtpServer.Send(mail);
        }
    }
}
