using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Admin
{
    public class AddItemRequest
    {
        public string SelectedItemCurrency { get; set; }
        public string SelectedItemType { get; set; }
        public string EnglishName { get; set; }
        public string SwahiliName { get; set; }
        public string EnglishDescription { get; set; }
        public string SwahiliDescription { get; set; }
        public decimal Price { get; set; }
        public decimal? GoalAmount { get; set; }
        public decimal? CurrentAmount { get; set; }
        public decimal? Need { get; set; }
        public bool AutoDecrement { get; set; }
        public decimal? DecrementPerDay { get; set; }
        public string ImageBase { get; set; }
    }
}
