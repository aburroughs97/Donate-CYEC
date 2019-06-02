﻿using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Account
{
    public class ValidateAccessTokenRequest
    {
        public int UserID { get; set; }
        public string AccessToken { get; set; }
    }

    public class UserAndSession
    {
        public User User { get; set; }
        public UserSession UserSession { get; set; }
    }
}
