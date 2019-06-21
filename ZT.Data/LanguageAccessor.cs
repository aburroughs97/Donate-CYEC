﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;

namespace ZT.Data
{
    public interface ILanguageAndCurrencyAccessor
    {
        Result UpdateCurrencyRates(List<Tuple<string, decimal>> list);
        Result<List<string>> GetLanguages();
        Result<List<string>> GetCurrencies();
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

        public Result<List<string>> GetCurrencies()
        {
            try
            {
                var currencies = _dBContext.Currency.Select(x => x.Code).ToList();
                return new Result<List<string>>(currencies);
            }
            catch (Exception ex)
            {
                return new Result<List<string>>(false, ex.Message);
            }
        }
    }
}