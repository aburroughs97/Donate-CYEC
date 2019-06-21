using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class DonateItemDescription
    {
        public int ItemDescriptionID { get; set; }
        public int ItemID { get; set; }
        public int LanguageID { get; set; }
        public string Description { get; set; }
    }
}
