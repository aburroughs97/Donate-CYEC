﻿using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Account;
using ZT.Data;

namespace ZT.Services
{
    public interface ILoginService
    {
        Result<User> CreateAccount(RegisterRequest request);
        Result<LogInResponse> LogIn(LogInRequest request);
        Result<UserSession> CreateAccessToken(int userID);
        Result<LogInResponse> ValidateAccessToken(ValidateAccessTokenRequest request);
        void RemoveAccessToken(ValidateAccessTokenRequest request);
        Result SendForgotPasswordEmail(string email);
        Result ValidateForgotPasswordToken(ValidateForgotPasswordTokenRequest request);
        Result ChangePassword(ChangePasswordRequest request);
    }
    public class LoginService : ILoginService
    {
        private readonly IConfiguration _configuration;
        private readonly IEncryptionService _encryptionService;
        private readonly IAccountAccessor _accountAccessor;
        private readonly IEmailService _emailService;
        private readonly IDonateService _donateService;

        public LoginService(IConfiguration configuration,
                                IEncryptionService encryptionService,
                                IAccountAccessor accountAccessor,
                                IEmailService emailService,
                                IDonateService donateService)
        {
            _configuration = configuration;
            _encryptionService = encryptionService;
            _accountAccessor = accountAccessor;
            _emailService = emailService;
            _donateService = donateService;
        }

        public Result<User> CreateAccount(RegisterRequest request)
        {
            //Validate  request
            if (string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return new Result<User>(false, "Bad request received.");
            }
            //Check for unique email
            if (_accountAccessor.FindUserByEmail(request.Email).Payload != null)
            {
                return new Result<User>(false, "Email address is already in use.");
            }

            var saltKey = _encryptionService.CreateSaltKey(Convert.ToInt32(_configuration["PasswordSaltLength"]));
            var hashedPassword = _encryptionService.CreatePasswordHash(request.Password, saltKey);

            //TODO: Add ENG/USD to appsettings as defaults
            return _accountAccessor.CreateAccount(request.Email, hashedPassword, saltKey, request.FirstName, request.LastName, "ENG", "USD");
        }

        public Result<LogInResponse> LogIn(LogInRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return new Result<LogInResponse>(false, "Bad request received.");
            }

            var userResult = _accountAccessor.FindUserByEmail(request.Email);
            if (!userResult.IsSuccess)
            {
                return new Result<LogInResponse>(false, "The email/password combination you entered is incorrect.");
            }
            var password = _accountAccessor.GetUserPassword(userResult.Payload.UserID).Payload;
            var hashedPassword = _encryptionService.CreatePasswordHash(request.Password, password.PasswordSalt);

            if (hashedPassword == password.Password)
            {
                var result = _accountAccessor.CreateLogInResponse(userResult.Payload.UserID);
                result.Payload.CartItems = _donateService.CheckCart(userResult.Payload.UserID);
                return result;
            }
            else
            {
                return new Result<LogInResponse>(false, "The email/password combination you entered is incorrect.");
            }
        }

        public Result<UserSession> CreateAccessToken(int userID)
        {
            if (_accountAccessor.FindUser(userID) == null) return new Result<UserSession>(false, "Invalid UserID received.");

            var accessToken = _encryptionService.CreateHash(Encoding.UTF8.GetBytes(DateTime.Now.ToString() + userID), _configuration["HashCode"]);
            var expiresOn = DateTime.Now.AddDays(14);
            return _accountAccessor.CreateAccessToken(userID, accessToken, expiresOn);
        }

        public Result<LogInResponse> ValidateAccessToken(ValidateAccessTokenRequest request)
        {
            var newToken = _encryptionService.CreateHash(Encoding.UTF8.GetBytes(DateTime.Now.ToString() + request.UserID), _configuration["HashCode"]);
            var result = _accountAccessor.ValidateAccessToken(request.UserID, request.AccessToken, newToken);
            if (result.IsSuccess)
            {
                //Create a new token with the same expiry date
                var response = _accountAccessor.CreateLogInResponse(request.UserID, result.Payload).Payload;
                response.CartItems = _donateService.CheckCart(request.UserID);
                return new Result<LogInResponse>(response);
            }
            else return new Result<LogInResponse>(false);
        }

        public void RemoveAccessToken(ValidateAccessTokenRequest request)
        {
            if (request == null) return;
            _accountAccessor.RemoveAccessToken(request.UserID, request.AccessToken);
        }

        public Result SendForgotPasswordEmail(string email)
        {
            var user = _accountAccessor.FindUserByEmail(email);
            if (!user.IsSuccess) return new Result(false, "Email address not registered.");

            var guid = Guid.NewGuid();
            var hashedGuid = _encryptionService.CreateHash(Encoding.UTF8.GetBytes(guid.ToString() + user.Payload.UserID), _configuration["HashCode"]);

            _accountAccessor.CreateUserPasswordReset(user.Payload.UserID, hashedGuid);
            try
            {
                _emailService.SendPasswordResetEmail(email, guid.ToString());
                return new Result(true);
            }
            catch (Exception e)
            {
                return new Result(false, e.Message);
            }
        }

        public Result ValidateForgotPasswordToken(ValidateForgotPasswordTokenRequest request)
        {
            var user = _accountAccessor.FindUserByEmail(request.Email);
            if (!user.IsSuccess) return new Result(false, "Invalid request received.");

            var hashedToken = _encryptionService.CreateHash(Encoding.UTF8.GetBytes(request.Token + user.Payload.UserID), _configuration["HashCode"]);

            return _accountAccessor.ValidateUserPasswordReset(user.Payload.UserID, hashedToken);
        }

        public Result ChangePassword(ChangePasswordRequest request)
        {
            var user = _accountAccessor.FindUserByEmail(request.Email);
            if (!user.IsSuccess) return new Result(false, "Invalid request received.");

            var saltKey = _encryptionService.CreateSaltKey(Convert.ToInt32(_configuration["PasswordSaltLength"]));
            var hashedPassword = _encryptionService.CreatePasswordHash(request.NewPassword, saltKey);

            _accountAccessor.ChangePassword(user.Payload.UserID, hashedPassword, saltKey);
            return new Result(true);
        }
    }
}
