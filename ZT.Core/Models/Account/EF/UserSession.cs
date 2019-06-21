using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Account
{
    public class UserSession
    {
        public int UserSessionID { get; set; }
        public int UserID { get; set; }
        public string AccessToken { get; set; }
        public DateTime ExpiresOn { get; set; }
    }
}
