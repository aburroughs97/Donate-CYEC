using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Account;
using ZT.Data;

namespace ZT.Services
{
    public interface IAccountService
    {
        Result<User> GetUser(int userID);
        Result<User> UpdateUser(int userID, string firstName, string lastName);
        Result ChangePassword(int userID, string currentPasword, string newPassword);
        Result UpdateLanguageAndCurrency(int userID, string languageName, string currencyCode);
        Result<List<string>> GetLanguages();
        Result<List<string>> GetCurrencies();

    }
    public class AccountService : IAccountService
    {
        private readonly IAccountAccessor _accountAccessor;
        private readonly ILanguageAndCurrencyAccessor _languageAccessor;
        private readonly IEncryptionService _encryptionService;
        private readonly IConfiguration _configuration;

        private readonly ILanguageAndCurrencyService _foo;

        public AccountService(IAccountAccessor accountAccessor,
                                ILanguageAndCurrencyAccessor languageAccessor,
                                IEncryptionService encryptionService,
                                IConfiguration configuration,
                                ILanguageAndCurrencyService foo)
        {
            _accountAccessor = accountAccessor;
            _languageAccessor = languageAccessor;
            _encryptionService = encryptionService;
            _configuration = configuration;
            _foo = foo;
        }

        public Result<User> GetUser(int userID)
        {
            return _accountAccessor.FindUser(userID);
        }

        public Result<User> UpdateUser(int userID, string firstName, string lastName)
        {
            if(string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
            {
                return new Result<User>(false, "Bad request received.");
            }

            return _accountAccessor.UpdateUser(userID, firstName, lastName);
        }

        public Result ChangePassword(int userID, string currentPassword, string newPassword)
        {
            if (string.IsNullOrEmpty(currentPassword) || string.IsNullOrEmpty(newPassword))
            {
                return new Result(false, "Bad request received.");
            }

            var passwordResult = _accountAccessor.GetUserPassword(userID);
            if(!passwordResult.IsSuccess)
            {
                return new Result(false, "User not found.");
            }

            var password = passwordResult.Payload;
            var hashedPassword = _encryptionService.CreatePasswordHash(currentPassword, password.PasswordSalt);

            if (hashedPassword == password.Password)
            {
                var newSaltKey = _encryptionService.CreateSaltKey(Convert.ToInt32(_configuration["PasswordSaltLength"]));
                var newHashedPassword = _encryptionService.CreatePasswordHash(newPassword, newSaltKey);
                _accountAccessor.ChangePassword(userID, newHashedPassword, newSaltKey);
                return new Result(true);
            }
            else
            {
                return new Result(false, "Current password was incorrect.");
            }

        }

        public Result UpdateLanguageAndCurrency(int userID, string languageName, string currencyCode)
        {
            var result = _accountAccessor.UpdateLanguageAndCurrency(userID, languageName, currencyCode);
            return result;
        }

        public Result<List<string>> GetLanguages()
        {
            return _languageAccessor.GetLanguages();
        }

        public Result<List<string>> GetCurrencies()
        {
            return _languageAccessor.GetCurrencies();
        }
    }
}
