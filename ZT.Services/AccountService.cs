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
        Result<UserSession> CreateAccessToken(int userID);
        ValidateAccessTokenResponse ValidateAccessToken(ValidateAccessTokenRequest request);
        void RemoveAccessToken(ValidateAccessTokenRequest request);

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

        public Result<UserSession> CreateAccessToken(int userID)
        {
            if (_accountAccessor.FindUser(userID) == null) return new Result<UserSession>(false, "Invalid UserID received.");

            var accessToken = _encryptionService.CreateHash(Encoding.UTF8.GetBytes(DateTime.Now.ToString() + userID), "SHA512");
            var expiresOn = DateTime.Now.AddDays(14);
            return _accountAccessor.CreateAccessToken(userID, accessToken, expiresOn);
        }

        public ValidateAccessTokenResponse ValidateAccessToken(ValidateAccessTokenRequest request)
        {
            var newToken = _encryptionService.CreateHash(Encoding.UTF8.GetBytes(DateTime.Now.ToString() + request.UserID), "SHA512");

            var result = _accountAccessor.ValidateAccessToken(request.UserID, request.AccessToken, newToken);
            if (result.IsSuccess)
            {
                //Create a new token with the same expiry date
                var user = _accountAccessor.FindUser(request.UserID);

                var response = new ValidateAccessTokenResponse
                {
                    IsSuccess = true,
                    User = user.Payload,
                    UserSession = result.Payload,
                };
                return response;
            }
            else return new ValidateAccessTokenResponse { IsSuccess = false };
        }

        public void RemoveAccessToken(ValidateAccessTokenRequest request)
        {
            _accountAccessor.RemoveAccessToken(request.UserID, request.AccessToken);
        }
    }
}
