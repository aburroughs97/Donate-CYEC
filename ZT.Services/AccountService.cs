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
        Result<User> CreateAccount(RegisterRequest request);
        Result<User> LogIn(LogInRequest request);
    }
    public class AccountService : IAccountService
    {
        private readonly IEncryptionService _encryptionService;
        private readonly IAccountAccessor _accountAccessor;
        public AccountService(IEncryptionService encryptionService,
                                IAccountAccessor accountAccessor)
        {
            _encryptionService = encryptionService;
            _accountAccessor = accountAccessor;
        }

        public Result<User> CreateAccount(RegisterRequest request)
        {
            //Validate  request
            if(string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return new Result<User>(false, "Bad request received.");
            }
            //Check for unique email
            if(_accountAccessor.FindUserByEmail(request.Email).Payload != null)
            {
                return new Result<User>(false, "Email address is already in use.");
            }

            var saltKey = _encryptionService.CreateSaltKey(5);
            var hashedPassword = _encryptionService.CreatePasswordHash(request.Password, saltKey);

            return _accountAccessor.CreateAccount(request.Email, hashedPassword, saltKey, request.FirstName, request.LastName);
        }

        public Result<User> LogIn(LogInRequest request)
        {
            if(string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return new Result<User>(false, "Bad request received.");
            }

            var userResult = _accountAccessor.FindUserByEmail(request.Email);
            if (!userResult.IsSuccess)
            {
                return new Result<User>(false, "The email/password combination you entered is incorrect.");
            }
            var password = _accountAccessor.GetUserPassword(userResult.Payload.UserID).Payload;
            var hashedPassword = _encryptionService.CreatePasswordHash(request.Password, password.PasswordSalt);

            if(hashedPassword == password.Password)
            {
                return userResult;
            }
            else
            {
                return new Result<User>(false, "The email/password combination you entered is incorrect.");
            }
        }
    }
}
