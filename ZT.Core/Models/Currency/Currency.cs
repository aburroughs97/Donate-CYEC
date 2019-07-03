using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core.Models.Currency
{
    public class Currency
    {
        public int CurrencyID { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public decimal ConversionRateFromUSD { get; set; }
        public int RoundDigits { get; set; }
        public string CurrencySymbol { get; set; }
        public bool SymbolBefore { get; set; }
    }
}
