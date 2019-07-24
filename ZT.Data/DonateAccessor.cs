using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using Microsoft.EntityFrameworkCore;
using System.IO;
using Microsoft.Extensions.Configuration;
using ZT.Core.Models.Inventory;

namespace ZT.Data
{
    public interface IDonateAccessor
    {
        Result<List<Item>> GetAllItems(string languageName, string currencyCode);
        Result<Item> GetItem(int itemID, string languageName, string currencyCode);
        Result<DonateItem> AddItem(DonateItem item);
        Result UpdateDonateItem(DonateItem item);
        Result<DonateItemTitle> AddItemTitle(DonateItemTitle title);
        Result<DonateItemDescription> AddItemDescription(DonateItemDescription description);
        Result<List<DonateItem>> GetDonateItems();
        Result UpdateDonateItemRange(List<DonateItem> items);
        Result<DonateItemImage> GetImage(int itemID);
        Result AddImage(DonateItemImage image);
        Result<List<CartItem>> LoadCart(int userID, string languageName, string currencyCode);
        int CheckCart(int userID);
        Result<int> AddToCart(DonateCartItem item);
        Result UpdateCartItem(CartItem item);
        Result RemoveCartItem(int userID, int itemID);
        Result<List<DonateCartItem>> GetCartItems(int userID);
        Result<Donation> MakeDonation(int userID, decimal total, string type);
        Result MakeDropOffDonation(DropOffDonation donation);
        Result AddDonationItems(List<DonationItem> items);
        Result ClearUserCart(int userID);
        void FixItems();
        Result ItemsDonated(List<DonationItem> items);
        Result<List<DonationPreview>> GetRecentDonations(int userID, string languageName, string currencyCode);
        List<string> GetItemNames(List<DonationItem> items);
        List<DonationItem> GetDonationsByStatus(string statusName);
        Donation GetDonation(int donationID);
        Result UpdateDonation(Donation donation);
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
                         }).OrderBy(x => x.Need).ToList();
            return new Result<List<Item>>(items);
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

        public Result<DonateItemImage> GetImage(int itemID)
        {
            try
            {
                var image = (from x in _dBContext.DonateItemImage where x.ItemID == itemID select x).First();
                return new Result<DonateItemImage>(image);
            }
            catch(Exception ex)
            {
                return new Result<DonateItemImage>(false, ex.Message);
            }
        }

        public Result AddImage(DonateItemImage image)
        {
            try
            {
                _dBContext.DonateItemImage.Add(image);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<CartItem>> LoadCart(int userID, string languageName, string currencyCode)
        {
            try
            {
                var languageID = (from x in _dBContext.Language where x.LanguageName == languageName select x.LanguageID).First();
                var currency = (from x in _dBContext.Currency where x.Code == currencyCode select x).First();
                var list = (from x in _dBContext.DonateCartItem
                            where x.UserID == userID
                            from y in _dBContext.DonateItem
                            where y.ItemID == x.ItemID
                            from z in _dBContext.DonateItemTitle
                            where z.ItemID == y.ItemID && z.LanguageID == languageID
                            select new CartItem
                            {
                                CartItemID = x.CartItemID,
                                ItemID = x.ItemID,
                                Name = z.Title,
                                Price = Round(y.Price * currency.ConversionRateFromUSD, currency.RoundDigits),
                                TotalAmount = x.TotalAmount * currency.ConversionRateFromUSD,
                                NumItems = x.NumItems,
                                Need = y.Need
                            }).ToList();
                return new Result<List<CartItem>>(list);
            }
            catch(Exception ex)
            {
                return new Result<List<CartItem>>(false, ex.Message);
            }

        }

        public int CheckCart(int userID)
        {
            var count = -1;
            try
            {
                count = (from x in _dBContext.DonateCartItem where x.UserID == userID select x.UserID).Count();
                return count;
            }
            catch
            {
                return count;
            }
        }

        public Result<int> AddToCart(DonateCartItem item)
        {
            try
            {
                var existingItem = (from x in _dBContext.DonateCartItem where x.UserID == item.UserID && x.ItemID == item.ItemID select x).FirstOrDefault();
                if(existingItem != null)
                {
                    existingItem.TotalAmount += item.TotalAmount;
                    if(existingItem.NumItems != null)
                    {
                        existingItem.NumItems += item.NumItems;
                    }
                    _dBContext.DonateCartItem.Update(existingItem);
                    _dBContext.SaveChanges();
                    return new Result<int>(0);
                }
                else
                {
                    _dBContext.DonateCartItem.Add(item);
                    _dBContext.SaveChanges();
                    return new Result<int>(1);
                }
            }
            catch(Exception ex)
            {
                return new Result<int>(false, ex.Message);
            }
        }

        public Result<Item> GetItem(int itemID, string languageName, string currencyCode)
        {
            var languageID = (from x in _dBContext.Language where x.LanguageName == languageName select x.LanguageID).First();
            var currency = (from x in _dBContext.Currency where x.Code == currencyCode select x).First();
            if (languageID == 0) return new Result<Item>(false, "Invalid language selected.");

            var item = (from x in _dBContext.DonateItem
                         where x.ItemID == itemID
                         from y in _dBContext.DonateItemDescription
                         from z in _dBContext.DonateItemTitle
                         where x.ItemID == y.ItemID && !x.IsDeleted && y.LanguageID == languageID && x.ItemID == z.ItemID && z.LanguageID == languageID
                         select new Item()
                         {
                             ItemID = x.ItemID,
                             ItemType = x.ItemType,
                             Title = z.Title,
                             Price = Round(x.Price * currency.ConversionRateFromUSD, currency.RoundDigits),
                             Description = y.Description,
                             Need = x.Need,
                         }).FirstOrDefault();
            return new Result<Item>(item);
        }

        public Result UpdateCartItem(CartItem item)
        {
            try
            {
                var itemToUpdate = (from x in _dBContext.DonateCartItem where x.CartItemID == item.CartItemID select x).First();
                itemToUpdate.TotalAmount = item.TotalAmount;
                itemToUpdate.NumItems = item.NumItems;
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result RemoveCartItem(int userID, int itemID)
        {
            try
            {
                var item = (from x in _dBContext.DonateCartItem where x.UserID == userID && x.ItemID == itemID select x).First();
                _dBContext.DonateCartItem.Remove(item);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<DonateCartItem>> GetCartItems(int userID)
        {
            var list = (from x in _dBContext.DonateCartItem where x.UserID == userID select x).ToList();
            return new Result<List<DonateCartItem>>(list);
        }

        public Result<Donation> MakeDonation(int userID, decimal total, string type)
        {
            try
            {
                var donation = new Donation
                {
                    UserID = userID,
                    TotalAmount = total,
                    Date = DateTime.Now,
                    DonationType = type,
                    StatusID = 1
                };

                _dBContext.Donation.Add(donation);
                _dBContext.SaveChanges();
                return new Result<Donation>(donation);
            }
            catch(Exception ex)
            {
                return new Result<Donation>(false, ex.Message);
            }
        }

        public Result MakeDropOffDonation(DropOffDonation donation)
        {
            try
            {
                _dBContext.DropOffDonation.Add(donation);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result AddDonationItems(List<DonationItem> items)
        {
            try
            {
                _dBContext.DonationItem.AddRange(items);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result ClearUserCart(int userID)
        {
            try
            {
                var list = (from x in _dBContext.DonateCartItem where x.UserID == userID select x);
                _dBContext.RemoveRange(list);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public void FixItems()
        {
            var list = (from x in _dBContext.InventoryItem select x);
            
            foreach(var invItem in list)
            {
                var newNeed = Math.Ceiling(invItem.ActualAmount) / invItem.GoalAmount;
                var item = (from x in _dBContext.DonateItem where x.ItemID == invItem.ItemID select x).First();
                item.Need = newNeed;
                _dBContext.DonateItem.Update(item);
            }
            _dBContext.SaveChanges();
        }

        public Result ItemsDonated(List<DonationItem> items)
        {
            try
            {
                var list = (from x in _dBContext.InventoryItem
                            from y in items
                            where x.ItemID == y.ItemID
                            select x);
                foreach (var item in list)
                {
                    var di = items.First(x => x.ItemID == item.ItemID);
                    item.ActualAmount += di.NumberOfItems.Value;
                }
                _dBContext.InventoryItem.UpdateRange(list);
                FixItems();
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<DonationPreview>> GetRecentDonations(int userID, string languageName, string currencyCode)
        {
            try
            {
                var languageID = (from x in _dBContext.Language where x.LanguageName == languageName select x.LanguageID).First();
                var currency = (from x in _dBContext.Currency where x.Code == currencyCode select x).First();
                var list = (from x in _dBContext.Donation where x.UserID == userID
                            from y in _dBContext.DonationStatus where x.StatusID == y.StatusID
                            select new DonationPreview
                            {
                                DonationID = x.DonationID,
                                TotalAmount = Round(x.TotalAmount * currency.ConversionRateFromUSD, currency.RoundDigits),
                                Date = x.Date,
                                Status = y.Name
                            }).ToList();

                foreach(var item in list)
                {
                    var items = _dBContext.DonationItem.Where(x => x.DonationID == item.DonationID).ToList();
                    if(items.Count == 1)
                    {
                        item.Name = (from x in _dBContext.DonateItemTitle where x.ItemID == items[0].ItemID && x.LanguageID == languageID select x).First().Title;
                    }
                    else
                    {
                        item.Name = "Multiple Items";
                    }
                }
                return new Result<List<DonationPreview>>(list);
            }
            catch(Exception ex)
            {
                return new Result<List<DonationPreview>>(false, ex.Message);
            }
        }

        public List<string> GetItemNames(List<DonationItem> items)
        {
            try
            {
                var list = (from x in items
                            from y in _dBContext.DonateItem where x.ItemID == y.ItemID
                            from z in _dBContext.DonateItemTitle where x.ItemID == z.ItemID && z.LanguageID == 1
                            select z.Title).ToList();
                return list;
            }
            catch
            {
                return null;
            }
        }

        public List<DonationItem> GetDonationsByStatus(string statusName)
        {
            try
            {
                var statusID = (from x in _dBContext.DonationStatus where x.Name == statusName select x.StatusID).First();
                var items = (from x in _dBContext.Donation where x.StatusID == statusID
                                 from y in _dBContext.DonationItem where x.DonationID == y.DonationID
                                 select y).ToList();
                return items;
                
            }
            catch
            {
                return null;
            }
        }

        public Result UpdateDonateItem(DonateItem item)
        {
            try
            {
                _dBContext.DonateItem.Update(item);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Donation GetDonation(int donationID)
        {
            try
            {
                var donation = _dBContext.Donation.First(x => x.DonationID == donationID);
                return donation;
            }
            catch
            {
                return null;
            }
        }

        public Result UpdateDonation(Donation donation)
        {
            try
            {
                _dBContext.Donation.Update(donation);
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
