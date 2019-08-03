using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Currency;
using ZT.Core.Models.Language;

namespace ZT.Data
{
    public interface ILanguageAndCurrencyAccessor
    {
        Result UpdateCurrencyRates(List<Tuple<string, decimal>> list);
        Result<List<string>> GetLanguages();
        Result<List<Currency>> GetCurrencies();
        Result<Currency> GetCurrencyByCode(string code);
        Result<Language> GetLanguageByCode(string code);
    }

    public class LanguageAndCurrencyAccessor: ILanguageAndCurrencyAccessor
    {
        readonly DBContext _dBContext;
        public LanguageAndCurrencyAccessor(DBContext dbContext)
        {
            _dBContext = dbContext;
        }

        public Result UpdateCurrencyRates(List<Tuple<string, decimal>> list)
        {
            try
            {
                foreach (var tuple in list)
                {
                    var code = tuple.Item1;
                    var value = tuple.Item2;

                    var currency = (from x in _dBContext.Currency where x.Code == code select x).First();
                    currency.ConversionRateFromUSD = value;
                    _dBContext.SaveChanges();
                }
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<string>> GetLanguages()
        {
            try
            {
                var languages = _dBContext.Language.Select(x => x.LanguageName).ToList();
                return new Result<List<string>>(languages);
            }
            catch (Exception ex)
            {
                return new Result<List<string>>(false, ex.Message);
            }
        }

        public Result<List<Currency>> GetCurrencies()
        {
            try
            {
                var currencies = _dBContext.Currency.Select(x => x).ToList();
                return new Result<List<Currency>>(currencies);
            }
            catch (Exception ex)
            {
                return new Result<List<Currency>>(false, ex.Message);
            }
        }

        public Result<Currency> GetCurrencyByCode(string code)
        {
            try
            {
                var currency = (from x in _dBContext.Currency where x.Code == code select x).First();
                return new Result<Currency>(currency);
            }
            catch(Exception ex)
            {
                return new Result<Currency>(false, ex.Message);
            }
        }

        public Result<Language> GetLanguageByCode(string code)
        {
            try
            {
                var lang = (from x in _dBContext.Language where x.LanguageCode == code select x).First();
                return new Result<Language>(lang);
            }
            catch (Exception ex)
            {
                return new Result<Language>(false, ex.Message);
            }
        }
    }
}
