using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using ZT.Core;
using ZT.Data;

namespace ZT.Services
{
    public interface ILanguageAndCurrencyService
    {
        Result UpdateCurrencyRates();
    }
    public class LanguageAndCurrencyService: ILanguageAndCurrencyService
    {
        private readonly ILanguageAndCurrencyAccessor _languageAndCurrencyAccessor;
        private readonly IConfiguration _configuration;

        public LanguageAndCurrencyService(ILanguageAndCurrencyAccessor languageAndCurrencyAccessor,
                                            IConfiguration configuration)
        {
            _languageAndCurrencyAccessor = languageAndCurrencyAccessor;
            _configuration = configuration;
        }

        public Result UpdateCurrencyRates()
        {
            var currencies = _languageAndCurrencyAccessor.GetCurrencies().Payload.Where(x => x != "USD").ToList();
            var updatedCurrencies = CheckCurrencyConversionRates(currencies);
            return _languageAndCurrencyAccessor.UpdateCurrencyRates(updatedCurrencies);
        }

        private List<Tuple<string, decimal>> CheckCurrencyConversionRates(List<string> codes)
        {
            try
            {
                var codeStr = codes[0];
                for(var i = 1; i < codes.Count; i++)
                {
                    codeStr += ("," + codes[i]);
                }

                string html = string.Empty;
                string url = _configuration["CurrencyConversionAPI"] + codeStr;

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.AutomaticDecompression = DecompressionMethods.GZip;

                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    html = reader.ReadToEnd();
                }

                var result = new List<Tuple<string, decimal>>();

                var obj = JsonConvert.DeserializeObject<JObject>(html);
                var innerObj = obj["rates"] as JObject;

                foreach(var code in codes)
                {
                    var rateStr = (string)innerObj[code];
                    var rate = Convert.ToDecimal(rateStr);
                    result.Add(new Tuple<string, decimal>(code, rate));
                }

                return result;
            }
            catch
            {
                return null;
            }
        }
    }
}
