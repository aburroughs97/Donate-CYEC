using System;
using System.Collections.Generic;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Account;
using ZT.Data;

namespace ZT.Services
{
    public interface IAdminService
    {
        Result<List<User>> GetAllUsers();
        Result MakeUserAdmin(int userID);
    }
    public class AdminService: IAdminService
    {
        private readonly IAccountAccessor _accountAccessor;
        public AdminService(IAccountAccessor accessor)
        {
            _accountAccessor = accessor;
        }

        public Result<List<User>> GetAllUsers()
        {
            return _accountAccessor.GetAllUsers();
        }

        public Result MakeUserAdmin(int userID)
        {
            return _accountAccessor.MakeUserAdmin(userID);
        }
    }
}
