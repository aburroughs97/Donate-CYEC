using System;
using System.Collections.Generic;

namespace ZT.Core.Models.Account
{
    public partial class UserPassword
    {
        public int UserPasswordID { get; set; }
        public int UserID { get; set; }
        public string Password { get; set; }
        public string PasswordSalt { get; set; }
        public DateTime? CreatedOnUtc { get; set; }
    }
}
