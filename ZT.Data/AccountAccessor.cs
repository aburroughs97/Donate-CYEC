using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Account;
using Microsoft.EntityFrameworkCore;

namespace ZT.Data
{
    public interface IAccountAccessor
    {
        Result<User> FindUser(int userID);
        Result<User> FindUserByEmail(string email);
        Result<User> CreateAccount(string email, string passwordHash, string passwordSalt, string firstName, string lastName, string languageCode, string currencyCode);
        Result<UserPassword> GetUserPassword(int userID);
        Result<UserSession> CreateAccessToken(int userID, string accessToken, DateTime expiresOn);
        Result<UserSession> ValidateAccessToken(int userID, string accessToken, string newToken);
        void RemoveAccessToken(int userID, string accessToken);
        void CreateUserPasswordReset(int userID, string resetCode);
        Result ValidateUserPasswordReset(int userID, string code);
        void ChangePassword(int userID, string newPasswordHash, string newPasswordSalt);
        Result<User> UpdateUser(int userID, string firstName, string lastName);
        Result<List<User>> GetAllUsers();
        Result MakeUserAdmin(int userID);
        Result<LogInResponse> CreateLogInResponse(int userID, UserSession session = null);
        Result UpdateLanguageAndCurrency(int userID, string languageName, string currencyCode);
    }
    public class AccountAccessor : IAccountAccessor
    {
        private readonly DBContext _dBContext;
        public AccountAccessor(DBContext dbContext)
        {
            _dBContext = dbContext;
        }
        
        public Result<User> CreateAccount(string email, string passwordHash, string passwordSalt, string firstName, string lastName, string languageCode, string currencyCode)
        {
            try
            {
                var languageID = (from x in _dBContext.Language where x.LanguageCode == languageCode select x.LanguageID).First();
                var currencyID = (from x in _dBContext.Currency where x.Code == currencyCode select x.CurrencyID).First();

                var user = new User
                {
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    IsAdmin = false,
                    LanguageID = languageID,
                    CurrencyID = currencyID
                };
                user = _dBContext.User.Add(user).Entity;
                _dBContext.SaveChanges();

                var userPassword = new UserPassword
                {
                    UserID = user.UserID,
                    Password = passwordHash,
                    PasswordSalt = passwordSalt,
                    CreatedOnUtc = DateTime.UtcNow
                };
                _dBContext.UserPassword.Add(userPassword);
                _dBContext.SaveChanges();

                return new Result<User>(user);
            }
            catch(Exception ex)
            {
                return new Result<User>(false, ex.Message);
            }

        }

        public Result<User> FindUser(int userID)
        {
            var user = (from x in _dBContext.User where x.UserID == userID select x).FirstOrDefault();
            return new Result<User>(user);
        }

        public Result<User> FindUserByEmail(string email)
        {
            var user = (from x in _dBContext.User
                        where x.Email == email
                        select x).FirstOrDefault();
            return new Result<User>(user);
        }

        public Result<UserPassword> GetUserPassword(int userID)
        {
            var userPassword = (from x in _dBContext.UserPassword
                        where x.UserID == userID
                        select x).FirstOrDefault();
            return new Result<UserPassword>(userPassword);

        }

        public Result<UserSession> CreateAccessToken(int userID, string accessToken, DateTime expiresOn)
        {
            var userSession = new UserSession
            {
                UserID = userID,
                AccessToken = accessToken,
                ExpiresOn = expiresOn,
            };
            _dBContext.UserSession.Add(userSession);
            _dBContext.SaveChanges();

            return new Result<UserSession>(userSession);
        }

        public Result<UserSession> ValidateAccessToken(int userID, string accessToken, string newToken)
        {
            var session = (from x in _dBContext.UserSession
                           where x.UserID == userID && x.AccessToken == accessToken
                           select x).FirstOrDefault();
            if(session == null)
            {
                return new Result<UserSession>(false, "Invalid token received.");
            }
            else if (DateTime.Now > session.ExpiresOn)
            {
                _dBContext.UserSession.Remove(session);
                _dBContext.SaveChanges();
                return new Result<UserSession>(false, "Token was expired.");
            }
            else
            {
                session.AccessToken = newToken;
                _dBContext.SaveChanges();
                return new Result<UserSession>(session);
            }
        }

        public void RemoveAccessToken(int userID, string accessToken)
        {
            var session = (from x in _dBContext.UserSession
                           where x.UserID == userID && x.AccessToken == accessToken
                           select x).FirstOrDefault();
            if(session != null)
            {
                _dBContext.UserSession.Remove(session);
                _dBContext.SaveChanges();
            }
        }

        public void CreateUserPasswordReset(int userID, string resetCode)
        {
            var oldReset = (from x in _dBContext.UserPasswordReset
                            where x.UserID == userID
                            select x).FirstOrDefault();
            if(oldReset != null)
            {
                oldReset.ResetCode = resetCode;
                oldReset.CreatedOn = DateTime.Now;
            }
            else
            {
                var reset = new UserPasswordReset
                {
                    UserID = userID,
                    ResetCode = resetCode,
                    CreatedOn = DateTime.Now
                };
                _dBContext.UserPasswordReset.Add(reset);
            }

            _dBContext.SaveChanges();
        }

        public Result ValidateUserPasswordReset(int userID, string code)
        {
            var reset = (from x in _dBContext.UserPasswordReset
                       where x.UserID == userID
                       select x).FirstOrDefault();
            if (reset.ResetCode != code)
            {
                return new Result(false, "Entered code is incorrect.");
            }
            else if (DateTime.Now > reset.CreatedOn.AddDays(1))
            {
                return new Result(false, "Entered code is expired. Please request a new code if you wish to reset your password.");
            }
            else
            {
                _dBContext.UserPasswordReset.Remove(reset);
                _dBContext.SaveChanges();
                return new Result(true);
            }
        }

        public void ChangePassword(int userID, string newPasswordHash, string newPasswordSalt)
        {
            var userPassword = (from x in _dBContext.UserPassword
                                where x.UserID == userID
                                select x).First();

            userPassword.Password = newPasswordHash;
            userPassword.PasswordSalt = newPasswordSalt;
            userPassword.CreatedOnUtc = DateTime.UtcNow;

            //Remove any open sessions when password is changed
            var openSessions = (from x in _dBContext.UserSession
                                where x.UserID == userID
                                select x);
            _dBContext.UserSession.RemoveRange(openSessions);
            _dBContext.SaveChanges();
        }

        public Result<User> UpdateUser(int userID, string firstName, string lastName)
        {
            var user = (from x in _dBContext.User
                        where x.UserID == userID
                        select x).FirstOrDefault();
            if (user == null) return new Result<User>(false, "User not found.");

            user.FirstName = firstName;
            user.LastName = lastName;
            _dBContext.SaveChanges();
            return new Result<User>(user);
        }

        public Result<List<User>> GetAllUsers()
        {
            return new Result<List<User>>(_dBContext.User.ToList());
        }

        public Result MakeUserAdmin(int userID)
        {
            var user = (from x in _dBContext.User
                        where x.UserID == userID
                        select x).FirstOrDefault();
            if (user == null) return new Result(false);

            user.IsAdmin = true;
            _dBContext.SaveChanges();
            return new Result(true);
        }

        public Result<LogInResponse> CreateLogInResponse(int userID, UserSession session = null)
        {
            var user = FindUser(userID).Payload;
            var languageCode = (from x in _dBContext.Language where x.LanguageID == user.LanguageID select x.LanguageName).FirstOrDefault();
            var currencyCode = (from x in _dBContext.Currency where x.CurrencyID == user.CurrencyID select x).FirstOrDefault();
            var response = new LogInResponse
            {
                User = user,
                UserSession = session,
                LanguageName = languageCode,
                CurrencyCode = currencyCode,
            };
            return new Result<LogInResponse>(response);
        }

        public Result UpdateLanguageAndCurrency(int userID, string languageName, string currencyCode)
        {
            try
            {
                var languageID = (from x in _dBContext.Language where x.LanguageName == languageName select x.LanguageID).First();
                var currencyID = (from x in _dBContext.Currency where x.Code == currencyCode select x.CurrencyID).First();

                var user = FindUser(userID).Payload;
                user.LanguageID = languageID;
                user.CurrencyID = currencyID;

                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }


    }
}
