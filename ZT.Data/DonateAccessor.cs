using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using Microsoft.EntityFrameworkCore;

namespace ZT.Data
{
    public interface IDonateAccessor
    {
        Result<List<Item>> GetAllItems(string languageName, string currencyCode);
        Result<DonateItem> AddItem(DonateItem item);
        Result<DonateItemDescription> AddItemDescription(DonateItemDescription description);
        Result<DonateItemImage> AddItemImage(DonateItemImage image);
        Result<List<DonateItemImage>> GetAllImages();
    }
    public class DonateAccessor : IDonateAccessor
    {
        private readonly DBContext _dBContext;
        public DonateAccessor(DBContext dbContext)
        {
            _dBContext = dbContext;
        }

        public Result<DonateItem> AddItem(DonateItem item)
        {
            _dBContext.DonateItem.Add(item);
            _dBContext.SaveChanges();
            return new Result<DonateItem>(item);
        }

        public Result<DonateItemDescription> AddItemDescription(DonateItemDescription description)
        {
            _dBContext.DonateItemDescription.Add(description);
            _dBContext.SaveChanges();
            return new Result<DonateItemDescription>(description);
        }

        public Result<DonateItemImage> AddItemImage(DonateItemImage image)
        {
            _dBContext.DonateItemImage.Add(image);
            _dBContext.SaveChanges();
            return new Result<DonateItemImage>(image);
        }

        public Result<List<DonateItemImage>> GetAllImages()
        {
            var images = _dBContext.DonateItemImage.ToList();
            return new Result<List<DonateItemImage>>(images);
        }

        public Result<List<Item>> GetAllItems(string languageName, string currencyCode)
        {
            var languageID = (from x in _dBContext.Language where x.LanguageName == languageName select x.LanguageID).First();
            var currencyMultipier = (from x in _dBContext.Currency where x.Code == currencyCode select x.ConversionRateFromUSD).First();
            if (languageID == 0) return new Result<List<Item>>(false, "Invalid language selected.");

            var items = (from x in _dBContext.DonateItem
                         from y in _dBContext.DonateItemDescription
                         where x.ItemID == y.ItemID && !x.IsDeleted && y.LanguageID == languageID
                         select new Item() {
                             ItemID = x.ItemID,
                             ItemType = x.ItemType,
                             Title = x.Title,
                             Price = x.Price * currencyMultipier,
                             Description = y.Description,
                             Need = x.Need,
                             ImageBase = ""
                         }).ToList();
            return new Result<List<Item>>(items);
        }

    }
}
