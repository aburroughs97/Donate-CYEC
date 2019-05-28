using System;
using System.Collections.Generic;

namespace ZT.Core.Models.Account
{
    public partial class User
    {
        public int UserID { get; set; }
        public Guid CustomerGuid { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
