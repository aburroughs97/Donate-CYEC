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
        //Result<User> LogIn(string email, string passwordHash);
        Result LogOut(int UserID);
        Result<User> FindUserByEmail(string email);
        Result<User> CreateAccount(string email, string passwordHash, string passwordSalt, string firstName, string lastName);
        Result<UserPassword> GetUserPassword(int userID);
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
                    CustomerGuid = Guid.NewGuid()
                };
                user = _dBContext.User.Add(user).Entity;
                _dBContext.SaveChanges();

                var userPassword = new UserPassword
                {
                    UserId = user.UserID,
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

        public Result<User> FindUserByEmail(string email)
        {
            var user = (from x in _dBContext.User
                        where x.Email == email
                        select x).FirstOrDefault();
            return new Result<User>(user);
        }

        //public Result<User> LogIn(string email, string passwordHash)
        //{
        //    var user = (from u in _dBContext.User
        //                join p in _dBContext.UserPassword
        //                on u.UserId equals p.UserId
        //                where u.Email == email && p.Password == passwordHash
        //                select u).FirstOrDefault();
        //    return new Result<User>(user);
        //}

        public Result<UserPassword> GetUserPassword(int userID)
        {
            var userPassword = (from x in _dBContext.UserPassword
                        where x.UserId == userID
                        select x).FirstOrDefault();
            return new Result<UserPassword>(userPassword);

        }

        public Result LogOut(int UserID)
        {
            throw new NotImplementedException();
        }
    }
}
