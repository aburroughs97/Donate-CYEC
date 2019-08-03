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
using ZT.Core.Models.Admin;
using ZT.Core.Models.Currency;

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
        Result<int> AddToCart(DonateCartItem item, string currencyCode);
        Result UpdateCartItem(CartItem item);
        Result RemoveCartItem(int userID, int itemID);
        Result<List<DonateCartItem>> GetCartItems(int userID, string currencyCode);
        Result<Donation> MakeDonation(int userID, decimal total, string type, string currencyCode);
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
        List<CampaignItem> GetCampaignItemRange(List<int> items, string currencyCode);
        Result<CampaignItem> GetCampaignItem(int itemID);
        Result AddCampaignItem(CampaignItem campaignItem);
        Result<ItemData> GetItemData(int itemID);
        Result UpdateItemTitle(int itemID, int languageID, string newTitle);
        Result UpdateItemDescription(int itemID, int languageID, string newDesc);
        Result UpdateCampaignItem(int itemID, int price, decimal currentAmount, int currencyID);
        Result<List<DropOffDonationData>> GetDropOffDonations();
        Result MarkAsDelivered(int donationID);
        Result<List<PaymentDonationData>> GetPaymentDonations();
        Result UpdateDonationStatus(int donationID, int statusID);
        Result MarkAsPurchased(int donationID);
        Result RemoveUndeliveredDropOffs();
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
                         where x.ItemID == y.ItemID && y.LanguageID == languageID && x.ItemID == z.ItemID && z.LanguageID == languageID
                         from cur in _dBContext.Currency
                         where x.CurrencyID == cur.CurrencyID
                         select new Item()
                         {
                             ItemID = x.ItemID,
                             ItemType = x.ItemType,
                             Title = z.Title,
                             Price = CalcPrice(cur, currencyCode, x.Price),
                             Description = y.Description,
                             Need = x.Need,
                         }).OrderBy(x => x.Need).ToList();
            return new Result<List<Item>>(items);
        }

        private decimal CalcPrice(Currency currency, string currencyCode, decimal price)
        {
            if (currency.Code == currencyCode) return price;
            if (currencyCode == "USD")
            {
                return Round(price / currency.ConversionRateFromUSD, currency.RoundDigits);
            }
            else
            {
                return Round(price * currency.ConversionRateFromUSD, currency.RoundDigits);
            }
        }

        private decimal Round(decimal price, int roundDigits)
        {
            if (roundDigits < 0)
            {
                var alteredPrice = price * (decimal)Math.Pow(10, roundDigits);
                alteredPrice = Math.Ceiling(alteredPrice);
                alteredPrice *= (decimal)Math.Pow(10, roundDigits * -1);
                return alteredPrice;
            }
            else if (roundDigits == 0)
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
                return new Result<List<DonateItem>>(_dBContext.DonateItem.ToList());
            }
            catch (Exception ex)
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
            catch (Exception ex)
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
            catch (Exception ex)
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
            catch (Exception ex)
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
                            from cur in _dBContext.Currency
                            where x.CurrencyID == cur.CurrencyID
                            from cur2 in _dBContext.Currency
                            where y.CurrencyID == cur2.CurrencyID
                            select new CartItem
                            {
                                CartItemID = x.CartItemID,
                                ItemID = x.ItemID,
                                Name = z.Title,
                                Price = CalcPrice(cur2, currencyCode, y.Price),
                                TotalAmount = CalcPrice(cur, currencyCode, x.TotalAmount),
                                NumItems = x.NumItems,
                                Need = y.Need
                            }).ToList();
                return new Result<List<CartItem>>(list);
            }
            catch (Exception ex)
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

        public Result<int> AddToCart(DonateCartItem item, string currencyCode)
        {
            try
            {
                var currency = (from x in _dBContext.Currency where x.Code == currencyCode select x).First();
                var existingItem = (from x in _dBContext.DonateCartItem where x.UserID == item.UserID && x.ItemID == item.ItemID select x).FirstOrDefault();
                if (existingItem != null)
                {
                    if (existingItem.CurrencyID == currency.CurrencyID)
                    {
                        existingItem.TotalAmount += item.TotalAmount;

                    }
                    else
                    {
                        var amount = CalcPrice(currency, currencyCode, item.TotalAmount);
                        existingItem.TotalAmount += amount;
                    }

                    if (existingItem.NumItems != null)
                    {
                        existingItem.NumItems += item.NumItems;
                    }

                    _dBContext.DonateCartItem.Update(existingItem);
                    _dBContext.SaveChanges();
                    return new Result<int>(0);
                }
                else
                {
                    item.CurrencyID = currency.CurrencyID;
                    _dBContext.DonateCartItem.Add(item);
                    _dBContext.SaveChanges();
                    return new Result<int>(1);
                }
            }
            catch (Exception ex)
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
                        where x.ItemID == y.ItemID && y.LanguageID == languageID && x.ItemID == z.ItemID && z.LanguageID == languageID
                        from cur in _dBContext.Currency
                        where x.CurrencyID == cur.CurrencyID
                        select new Item()
                        {
                            ItemID = x.ItemID,
                            ItemType = x.ItemType,
                            Title = z.Title,
                            Price = CalcPrice(cur, currencyCode, x.Price),
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
            catch (Exception ex)
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
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<DonateCartItem>> GetCartItems(int userID, string currencyCode)
        {
            var currencyID = (from x in _dBContext.Currency where x.Code == currencyCode select x.CurrencyID).First();
            var list = (from x in _dBContext.DonateCartItem
                        where x.UserID == userID
                        from cur in _dBContext.Currency
                        where x.CurrencyID == cur.CurrencyID
                        select new DonateCartItem
                        {
                            CartItemID = x.CartItemID,
                            UserID = x.UserID,
                            ItemID = x.ItemID,
                            TotalAmount = CalcPrice(cur, currencyCode, x.TotalAmount),
                            NumItems = x.NumItems,
                            CurrencyID = currencyID
                        }).ToList();
            return new Result<List<DonateCartItem>>(list);
        }

        public Result<Donation> MakeDonation(int userID, decimal total, string type, string currencyCode)
        {
            try
            {
                var currencyID = (from x in _dBContext.Currency where x.Code == currencyCode select x.CurrencyID).First();
                var donation = new Donation
                {
                    UserID = userID,
                    TotalAmount = total,
                    Date = DateTime.Now,
                    DonationType = type,
                    StatusID = 1,
                    CurrencyID = currencyID
                };

                _dBContext.Donation.Add(donation);
                _dBContext.SaveChanges();
                return new Result<Donation>(donation);
            }
            catch (Exception ex)
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
            catch (Exception ex)
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
            catch (Exception ex)
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
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public void FixItems()
        {
            var list = (from x in _dBContext.InventoryItem select x);

            foreach (var invItem in list)
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
            catch (Exception ex)
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
                var list = (from x in _dBContext.Donation
                            where x.UserID == userID
                            from y in _dBContext.DonationStatus
                            where x.StatusID == y.StatusID
                            from cur in _dBContext.Currency
                            where x.CurrencyID == cur.CurrencyID
                            select new DonationPreview
                            {
                                DonationID = x.DonationID,
                                TotalAmount = CalcPrice(cur, currencyCode, x.TotalAmount),
                                Date = x.Date,
                                Status = y.Name
                            }).OrderByDescending(x => x.Date).ToList();

                foreach (var item in list)
                {
                    var items = _dBContext.DonationItem.Where(x => x.DonationID == item.DonationID).ToList();
                    if (items.Count == 1)
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
            catch (Exception ex)
            {
                return new Result<List<DonationPreview>>(false, ex.Message);
            }
        }

        public List<string> GetItemNames(List<DonationItem> items)
        {
            try
            {
                var list = (from x in items
                            from y in _dBContext.DonateItem
                            where x.ItemID == y.ItemID
                            from z in _dBContext.DonateItemTitle
                            where x.ItemID == z.ItemID && z.LanguageID == 1
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
                var items = (from x in _dBContext.Donation
                             where x.StatusID == statusID
                             from y in _dBContext.DonationItem
                             where x.DonationID == y.DonationID
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
            catch (Exception ex)
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
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public List<CampaignItem> GetCampaignItemRange(List<int> items, string currencyCode)
        {
            try
            {
                var currencyID = (from x in _dBContext.Currency where x.Code == currencyCode select x.CurrencyID).First();
                var list = (from x in _dBContext.CampaignItem
                            where items.Contains(x.ItemID)
                            from y in _dBContext.Currency
                            where x.CurrencyID == y.CurrencyID
                            select new CampaignItem
                            {
                                CampaignItemID = x.CampaignItemID,
                                ItemID = x.ItemID,
                                ActualAmount = CalcPrice(y, currencyCode, x.ActualAmount),
                                GoalAmount = (int)CalcPrice(y, currencyCode, x.GoalAmount),
                                CurrencyID = currencyID
                            }).ToList();
                return list;
            }
            catch
            {
                return null;
            }
        }

        public Result<CampaignItem> GetCampaignItem(int itemID)
        {
            try
            {
                var item = (from x in _dBContext.CampaignItem where x.ItemID == itemID select x).First();
                return new Result<CampaignItem>(item);
            }
            catch (Exception ex)
            {
                return new Result<CampaignItem>(false, ex.Message);
            }
        }

        public Result AddCampaignItem(CampaignItem campaignItem)
        {
            try
            {
                _dBContext.CampaignItem.Add(campaignItem);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<ItemData> GetItemData(int itemID)
        {
            try
            {
                var item = (from x in _dBContext.DonateItem where x.ItemID == itemID select x).First();
                var engTitle = (from x in _dBContext.DonateItemTitle where x.ItemID == itemID && x.LanguageID == 1 select x.Title).First();
                var swaTitle = (from x in _dBContext.DonateItemTitle where x.ItemID == itemID && x.LanguageID == 2 select x.Title).First();

                var engDesc = (from x in _dBContext.DonateItemDescription where x.ItemID == itemID && x.LanguageID == 1 select x.Description).First();
                var swaDesc = (from x in _dBContext.DonateItemDescription where x.ItemID == itemID && x.LanguageID == 2 select x.Description).First();

                var itemData = new ItemData
                {
                    ItemID = itemID,
                    SelectedItemCurrency = "USD",
                    SelectedItemType = item.ItemType,
                    EnglishName = engTitle,
                    SwahiliName = swaTitle,
                    EnglishDescription = engDesc,
                    SwahiliDescription = swaDesc,
                    Price = item.Price,
                    Need = item.Need
                };

                return new Result<ItemData>(itemData);
            }
            catch (Exception ex)
            {
                return new Result<ItemData>(false, ex.Message);
            }
        }

        public Result UpdateItemTitle(int itemID, int languageID, string newTitle)
        {
            try
            {
                var title = (from x in _dBContext.DonateItemTitle where x.ItemID == itemID && x.LanguageID == languageID select x).First();
                title.Title = newTitle;
                _dBContext.DonateItemTitle.Update(title);
                _dBContext.SaveChanges();

                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result UpdateItemDescription(int itemID, int languageID, string newDesc)
        {
            try
            {
                var desc = (from x in _dBContext.DonateItemDescription where x.ItemID == itemID && x.LanguageID == languageID select x).First();
                desc.Description = newDesc;
                _dBContext.DonateItemDescription.Update(desc);
                _dBContext.SaveChanges();

                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result UpdateCampaignItem(int itemID, int goalAmount, decimal currentAmount, int currencyID)
        {
            try
            {
                var item = (from x in _dBContext.CampaignItem where x.ItemID == itemID select x).First();
                item.GoalAmount = goalAmount;
                item.ActualAmount = currentAmount;
                item.CurrencyID = currencyID;
                _dBContext.CampaignItem.Update(item);
                _dBContext.SaveChanges();

                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<DropOffDonationData>> GetDropOffDonations()
        {
            try
            {
                var conversion = (from x in _dBContext.Currency where x.Code == "KES" select x.ConversionRateFromUSD).First();
                var deliveringTodayList = (from x in _dBContext.Donation
                                           where x.DonationType == "dropoff"
                                           from y in _dBContext.DropOffDonation
                                           where x.DonationID == y.DonationID && y.DeliveryDate.Date == DateTime.Now.Date
                                           from z in _dBContext.User
                                           where x.UserID == z.UserID && x.StatusID == 1
                                           from cur in _dBContext.Currency
                                           where x.CurrencyID == cur.CurrencyID
                                           select new DropOffDonationData
                                           {
                                               DonationID = x.DonationID,
                                               FullName = z.FirstName + " " + z.LastName,
                                               TotalAmount = CalcPrice(cur, "KES", x.TotalAmount),
                                               Date = x.Date,
                                               DeliveryDate = y.DeliveryDate,
                                               Delivered = false
                                           });

                var undeliveredList = (from x in _dBContext.Donation
                                       where x.DonationType == "dropoff"
                                       from y in _dBContext.DropOffDonation
                                       where x.DonationID == y.DonationID && y.DeliveryDate.Date != DateTime.Now.Date
                                       from z in _dBContext.User
                                       where x.UserID == z.UserID && x.StatusID == 1
                                       from cur in _dBContext.Currency
                                       where cur.CurrencyID == x.CurrencyID
                                       select new DropOffDonationData
                                       {
                                           DonationID = x.DonationID,
                                           FullName = z.FirstName + " " + z.LastName,
                                           TotalAmount = CalcPrice(cur, "KES", x.TotalAmount),
                                           Date = x.Date,
                                           DeliveryDate = y.DeliveryDate,
                                           Delivered = false
                                       }).OrderBy(x => x.DeliveryDate);

                var deliveredList = (from x in _dBContext.Donation
                                     where x.DonationType == "dropoff"
                                     from y in _dBContext.DropOffDonation
                                     where x.DonationID == y.DonationID
                                     from z in _dBContext.User
                                     where x.UserID == z.UserID && x.StatusID > 1
                                     from cur in _dBContext.Currency
                                     where cur.CurrencyID == x.CurrencyID
                                     select new DropOffDonationData
                                     {
                                         DonationID = x.DonationID,
                                         FullName = z.FirstName + " " + z.LastName,
                                         TotalAmount = CalcPrice(cur, "KES", x.TotalAmount),
                                         Date = x.Date,
                                         DeliveryDate = y.DeliveryDate,
                                         Delivered = true
                                     }).OrderBy(x => x.DonationID);


                return new Result<List<DropOffDonationData>>(deliveringTodayList.Concat(undeliveredList.Concat(deliveredList)).ToList());
            }
            catch (Exception ex)
            {
                return new Result<List<DropOffDonationData>>(false, ex.Message);
            }
        }

        public Result MarkAsDelivered(int donationID)
        {
            try
            {
                var donation = (from x in _dBContext.Donation where x.DonationID == donationID select x).First();
                donation.StatusID = 2;
                _dBContext.Donation.Update(donation);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result<List<PaymentDonationData>> GetPaymentDonations()
        {
            try
            {
                var conversion = (from x in _dBContext.Currency where x.Code == "KES" select x.ConversionRateFromUSD).First();
                var verified = (from d in _dBContext.Donation
                                where d.DonationType != "dropoff" && d.StatusID == 6
                                from di in _dBContext.DonationItem
                                where d.DonationID == di.DonationID
                                from i in _dBContext.DonateItem
                                where di.ItemID == i.ItemID
                                from it in _dBContext.DonateItemTitle
                                where i.ItemID == it.ItemID && it.LanguageID == 1
                                from u in _dBContext.User
                                where d.UserID == u.UserID
                                from s in _dBContext.DonationStatus
                                where d.StatusID == s.StatusID
                                from cur in _dBContext.Currency
                                where cur.CurrencyID == d.CurrencyID
                                select new PaymentDonationData
                                {
                                    DonationID = d.DonationID,
                                    FullName = u.FirstName + " " + u.LastName,
                                    ItemName = it.Title,
                                    NumberOfItems = di.NumberOfItems,
                                    TotalAmount = CalcPrice(cur, "KES", d.TotalAmount),
                                    Date = d.Date,
                                    Status = s.Name
                                }).OrderBy(x => x.Date);

                var list = (from d in _dBContext.Donation
                            where d.DonationType != "dropoff" && d.StatusID != 6
                            from di in _dBContext.DonationItem
                            where d.DonationID == di.DonationID
                            from i in _dBContext.DonateItem
                            where di.ItemID == i.ItemID
                            from it in _dBContext.DonateItemTitle
                            where i.ItemID == it.ItemID && it.LanguageID == 1
                            from u in _dBContext.User
                            where d.UserID == u.UserID
                            from s in _dBContext.DonationStatus
                            where d.StatusID == s.StatusID
                            from cur in _dBContext.Currency
                            where cur.CurrencyID == d.CurrencyID
                            select new PaymentDonationData
                            {
                                DonationID = d.DonationID,
                                FullName = u.FirstName + " " + u.LastName,
                                ItemName = it.Title,
                                NumberOfItems = di.NumberOfItems,
                                TotalAmount = CalcPrice(cur, "KES", d.TotalAmount),
                                Date = d.Date,
                                Status = s.Name
                            }).OrderByDescending(x => x.Date);

                return new Result<List<PaymentDonationData>>(verified.Concat(list).ToList());
            }
            catch (Exception ex)
            {
                return new Result<List<PaymentDonationData>>(false, ex.Message);
            }
        }

        public Result UpdateDonationStatus(int donationID, int statusID)
        {
            try
            {
                var donation = (from x in _dBContext.Donation where x.DonationID == donationID select x).First();
                donation.StatusID = statusID;
                _dBContext.Donation.Update(donation);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result MarkAsPurchased(int donationID)
        {
            try
            {
                var donation = (from x in _dBContext.Donation where x.DonationID == donationID select x).First();
                donation.StatusID = 7;
                _dBContext.Donation.Update(donation);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }

        public Result RemoveUndeliveredDropOffs()
        {
            try
            {
                var date = DateTime.Now.Date;
                var undelivered = (from x in _dBContext.DropOffDonation
                                   where x.DeliveryDate.AddDays(7).Date < date
                                   select x);

                var donations = (from y in _dBContext.Donation
                                 where undelivered.Any(x => x.DonationID == y.DonationID)
                                 select y);
                _dBContext.Donation.RemoveRange(donations);
                _dBContext.DropOffDonation.RemoveRange(undelivered);
                _dBContext.SaveChanges();
                return new Result(true);
            }
            catch (Exception ex)
            {
                return new Result(false, ex.Message);
            }
        }
    }
}
