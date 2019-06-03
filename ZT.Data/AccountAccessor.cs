﻿using System;
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
        //Result<User> LogIn(string email, string passwordHash);
        Result LogOut(int UserID);
        Result<User> FindUser(int userID);
        Result<User> FindUserByEmail(string email);
        Result<User> CreateAccount(string email, string passwordHash, string passwordSalt, string firstName, string lastName);
        Result<UserPassword> GetUserPassword(int userID);
        Result<UserSession> CreateAccessToken(int userID, string accessToken, DateTime expiresOn);
        Result<UserSession> ValidateAccessToken(int userID, string accessToken, string newToken);
        void RemoveAccessToken(int userID, string accessToken);
        void CreateUserPasswordReset(int userID, string resetCode);
    }
    public class AccountAccessor : IAccountAccessor
    {
        DBContext _dBContext;
        public AccountAccessor(DBContext dbContext)
        {
            _dBContext = dbContext;
        }
        
        public Result<User> CreateAccount(string email, string passwordHash, string passwordSalt, string firstName, string lastName)
        {
            try
            {
                var user = new User
                {
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    IsAdmin = false
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

        public Result LogOut(int UserID)
        {
            throw new NotImplementedException();
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
            _dBContext.UserSession.Remove(session);
            _dBContext.SaveChanges();
        }

        public void CreateUserPasswordReset(int userID, string resetCode)
        {
            var reset = new UserPasswordReset
            {
                UserID = userID,
                ResetCode = resetCode,
                CreatedOn = DateTime.Now
            };
            _dBContext.UserPasswordReset.Add(reset);
            _dBContext.SaveChanges();
        }
    }
}
