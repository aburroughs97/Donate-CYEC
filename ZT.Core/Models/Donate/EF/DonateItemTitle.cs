using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonateItemTitle
    {
        public int ItemTitleID { get; set; }
        public int ItemID { get; set; }
        public int LanguageID { get; set; }
        public string Title { get; set; }
    }
}
