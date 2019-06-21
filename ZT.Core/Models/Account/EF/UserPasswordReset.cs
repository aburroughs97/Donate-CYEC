using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Account
{
    public class UserPasswordReset
    {
        public int UserPasswordResetID { get; set; }
        public int UserID { get; set; }
        public string ResetCode { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
