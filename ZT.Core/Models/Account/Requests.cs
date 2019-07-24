using System;
using System.Collections.Generic;
using System.Text;
using ZT.Core.Models.Currency;

namespace ZT.Core.Models.Account
{
    public class LogInRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class ValidateAccessTokenRequest
    {
        public int UserID { get; set; }
        public string AccessToken { get; set; }
    }

    public class LogInResponse
    {
        public User User { get; set; }
        public UserSession UserSession { get; set; }
        public int CartItems { get; set; }
        public string LanguageName { get; set; }
        public Currency.Currency CurrencyCode { get; set; }
    }

    public class ValidateForgotPasswordTokenRequest
    {
        public string Email { get; set; }
        public string Token { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
    }
}
