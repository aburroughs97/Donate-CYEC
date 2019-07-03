using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using Microsoft.EntityFrameworkCore;
using System.IO;
using Microsoft.Extensions.Configuration;

namespace ZT.Data
{
    public interface IDonateAccessor
    {
        Result<List<Item>> GetAllItems(string languageName, string currencyCode);
        Result<DonateItem> AddItem(DonateItem item);
        Result<DonateItemTitle> AddItemTitle(DonateItemTitle title);
        Result<DonateItemDescription> AddItemDescription(DonateItemDescription description);
        Result<List<DonateItem>> GetDonateItems();
        Result UpdateDonateItemRange(List<DonateItem> items);
    }
    public class DonateAccessor : IDonateAccessor
    {
        private readonly DBContext _dBContext;
        private readonly IConfiguration _configuration;

        public DonateAccessor(DBContext dbContext, IConfiguration configuration)
        {
            _dBContext = dbContext;
            _configuration = configuration;
        }

        public Result<DonateItem> AddItem(DonateItem item)
        {
            _dBContext.DonateItem.Add(item);
            _dBContext.SaveChanges();
            return new Result<DonateItem>(item);
        }

        public Result<DonateItemTitle> AddItemTitle(DonateItemTitle title)
        {
            _dBContext.DonateItemTitle.Add(title);
            _dBContext.SaveChanges();
            return new Result<DonateItemTitle>(title);
        }

        public Result<DonateItemDescription> AddItemDescription(DonateItemDescription description)
        {
            _dBContext.DonateItemDescription.Add(description);
            _dBContext.SaveChanges();
            return new Result<DonateItemDescription>(description);
        }

        public Result<List<Item>> GetAllItems(string languageName, string currencyCode)
        {
            var languageID = (from x in _dBContext.Language where x.LanguageName == languageName select x.LanguageID).First();
            var currency = (from x in _dBContext.Currency where x.Code == currencyCode select x).First();
            if (languageID == 0) return new Result<List<Item>>(false, "Invalid language selected.");

            var items = (from x in _dBContext.DonateItem
                         from y in _dBContext.DonateItemDescription
                         from z in _dBContext.DonateItemTitle
                         where x.ItemID == y.ItemID && !x.IsDeleted && y.LanguageID == languageID && x.ItemID == z.ItemID && z.LanguageID == languageID
                         select new Item() {
                             ItemID = x.ItemID,
                             ItemType = x.ItemType,
                             Title = z.Title,
                             Price = Round(x.Price * currency.ConversionRateFromUSD, currency.RoundDigits),
                             Description = y.Description,
                             Need = x.Need,
                             ImagePath = CalcImagePath(x.ItemID)
                         }).OrderBy(x => x.Need).ToList();
            return new Result<List<Item>>(items);
        }

        private string CalcImagePath(int id)
        {
            var idStr = id.ToString();
            if (idStr.Length % 2 != 0) idStr = "0" + idStr;
            idStr = new string(idStr.Reverse().ToArray());

            var path = "";
            while (idStr.Length > 2)
            {
                Path.Combine(path, idStr.Take(2).ToString());
                idStr = idStr.Substring(2);
            }

            return Path.Combine(path, idStr + ".JPG");
        }

        private decimal Round(decimal price, int roundDigits)
        {
            if(roundDigits < 0)
            {
                var alteredPrice = price * (decimal)Math.Pow(10, roundDigits);
                alteredPrice = Math.Ceiling(alteredPrice);
                alteredPrice = alteredPrice * (decimal)Math.Pow(10, roundDigits * -1);
                return alteredPrice;
            }
            else if(roundDigits == 0)
            {
                return Math.Ceiling(price);
            }
            else
            {
                return Math.Round(price, roundDigits);
            }
        }

        public Result<List<DonateItem>> GetDonateItems()
        {
            try
            {
                return new Result<List<DonateItem>>(_dBContext.DonateItem.Where(x => !x.IsDeleted).ToList());
            }
            catch(Exception ex)
            {
                return new Result<List<DonateItem>>(false, ex.Message);
            }
        }

        public Result UpdateDonateItemRange(List<DonateItem> items)
        {
            try
            {
                _dBContext.DonateItem.UpdateRange(items);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }
    }
}
