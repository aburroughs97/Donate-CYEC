using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Donate
{
    public class CampaignItem
    {
        public int CampaignItemID { get; set; }
        public int ItemID { get; set; }
        public int GoalAmount { get; set; }
        public decimal ActualAmount { get; set; }
        public int CurrencyID { get; set; }
    }
}
