using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ZT.Core;
using ZT.Core.Models.Donate;
using ZT.Data;

namespace ZT.Services
{
    public interface IDonateService
    {
        Result<List<Item>> GetAllItems(string languageName, string currencyCode);
        Result<Item> GetItem(int itemID, string languageName, string currencyCode);
        Result<DonateItemImage> GetImage(int itemID);
        void AddImages();
        Result<List<CartItem>> LoadCart(int userID, string languageName, string currencyCode);
        int CheckCart(int userID);
        Result<int> AddToCart(int userID, int itemID, decimal totalAmount, int? numItems, string currencyCode);
        Result UpdateCartItem(CartItem item);
        Result RemoveCartItem(int userID, int itemID);
        Result MakeDropOffDonation(int userID, DateTime date, string currencyCode);
        void FixItems();
        Result<List<DonationPreview>> GetRecentDonations(int userID, string languageName, string currencyCode);
        Result UpdateReadyItems();
    }

    public class DonateService : IDonateService
    {
        private readonly IDonateAccessor _donateAccessor;
        private readonly IInventoryAccessor _inventoryAccessor;
        private readonly IEmailService _emailService;
        private readonly IAccountAccessor _accountAccessor;

        public DonateService(IDonateAccessor donateAccessor,
                                IInventoryAccessor inventoryAccessor,
                                IEmailService emailService,
                                IAccountAccessor accountAccessor)
        {
            _donateAccessor = donateAccessor;
            _inventoryAccessor = inventoryAccessor;
            _emailService = emailService;
            _accountAccessor = accountAccessor;
        }

        public Result<List<Item>> GetAllItems(string languageName, string currencyCode)
        {
            var listResult = _donateAccessor.GetAllItems(languageName, currencyCode);
            if (!listResult.IsSuccess) return listResult;

            var list = listResult.Payload;
            var inventoryList = _inventoryAccessor.GetInventoryItemRange(list.Where(x => x.ItemType == "direct").Select(x => x.ItemID).ToList()).Payload;
            var newList = list.Join(inventoryList, x => x.ItemID, y => y.ItemID, (x, y) =>
            {
                return new Item
                {
                    ItemID = x.ItemID,
                    ItemType = x.ItemType,
                    Title = x.Title,
                    Price = x.Price,
                    Description = x.Description,
                    Need = x.Need,
                    GoalAmount = y.GoalAmount,
                    ActualAmount = (int)Math.Ceiling(y.ActualAmount)
                };
            });

            var campaignList = _donateAccessor.GetCampaignItemRange(list.Where(x => x.ItemType != "direct").Select(x => x.ItemID).ToList(), currencyCode);
            var newList2 = list.Join(campaignList, x => x.ItemID, y => y.ItemID, (x, y) =>
            {
                return new Item
                {
                    ItemID = x.ItemID,
                    ItemType = x.ItemType,
                    Title = x.Title,
                    Price = x.Price,
                    Description = x.Description,
                    Need = x.Need,
                    GoalAmount = y.GoalAmount,
                    ActualAmount = y.ActualAmount
                };
            });

            return new Result<List<Item>>(newList.Concat(newList2).OrderBy(x => x.Need).ToList());
        }

        public Result<DonateItemImage> GetImage(int itemID)
        {
            return _donateAccessor.GetImage(itemID);
        }

        public void AddImages()
        {
            var dir = Directory.GetCurrentDirectory();
            dir = Path.Combine(dir, "ClientApp", "src", "media", "Samples");

            int itemID = 1;
            foreach(string file in Directory.EnumerateFiles(dir))
            {
                var stream = new MemoryStream();
                using (Image<Rgba32> image = Image.Load(file))
                {
                    var width = Math.Min(image.Width, image.Height);
                    image.Mutate(x => x.Crop(width, width));
                    image.SaveAsJpeg(stream);  
                }
                var bytes = stream.ToArray();
                var itemImage = new DonateItemImage
                {
                    ItemImageID = 0,
                    ItemID = itemID,
                    ImageData = bytes
                };
                _donateAccessor.AddImage(itemImage);
                stream.Dispose();
                itemID++;
            }
        }

        public Result<List<CartItem>> LoadCart(int userID, string languageName, string currencyCode)
        {
            return _donateAccessor.LoadCart(userID, languageName, currencyCode);
        }

        public int CheckCart(int userID)
        {
            return _donateAccessor.CheckCart(userID);
        }

        public Result<int> AddToCart(int userID, int itemID, decimal totalAmount, int? numItems, string currencyCode)
        {
            var item = new DonateCartItem
            {
                UserID = userID,
                ItemID = itemID,
                TotalAmount = totalAmount,
                NumItems = numItems
            };
            return _donateAccessor.AddToCart(item, currencyCode);
        }

        public Result<Item> GetItem(int itemID, string languageName, string currencyCode)
        {
            var result = _donateAccessor.GetItem(itemID, languageName, currencyCode);
            if (!result.IsSuccess) return result;

            var item = result.Payload;
            if(item.ItemType == "direct")
            {
                var invItemResult = _inventoryAccessor.GetItem(itemID);
                if (!invItemResult.IsSuccess) return new Result<Item>(false, invItemResult.Message);
                var invItem = invItemResult.Payload;

                item.GoalAmount = invItem.GoalAmount;
                item.ActualAmount = (int)Math.Ceiling(invItem.ActualAmount);
            }
            else
            {
                var campaignItemResult = _donateAccessor.GetCampaignItem(itemID);
                if (!campaignItemResult.IsSuccess) return new Result<Item>(false, campaignItemResult.Message);
                var campaignItem = campaignItemResult.Payload;

                item.GoalAmount = campaignItem.GoalAmount;
                item.ActualAmount = campaignItem.ActualAmount;
            }

            return new Result<Item>(item);
        }

        public Result UpdateCartItem(CartItem item)
        {
            return _donateAccessor.UpdateCartItem(item);
        }

        public Result RemoveCartItem(int userID, int itemID)
        {
            return _donateAccessor.RemoveCartItem(userID, itemID);
        }

        public Result MakeDropOffDonation(int userID, DateTime date, string currencyCode)
        {
            var cartItems = _donateAccessor.GetCartItems(userID, currencyCode).Payload;

            var total = cartItems.Sum(x => x.TotalAmount);

            var donationResult = _donateAccessor.MakeDonation(userID, total, "dropoff", currencyCode);
            if (!donationResult.IsSuccess) return new Result(false, donationResult.Message);

            var donation = donationResult.Payload;

            var dropOffDonation = new DropOffDonation
            {
                DonationID = donation.DonationID,
                DeliveryDate = date
            };

            _donateAccessor.MakeDropOffDonation(dropOffDonation);

            var items = cartItems.Select(x => new DonationItem
            {
                DonationID = donation.DonationID,
                ItemID = x.ItemID,
                TotalAmount = x.TotalAmount,
                NumberOfItems = x.NumItems,
                CurrencyID = x.CurrencyID
            }).ToList();

            var itemsResult = _donateAccessor.AddDonationItems(items);
            if(itemsResult.IsSuccess)
            {
                _donateAccessor.ClearUserCart(userID);
            }

            SendDropOffDonationConfirmationEmail(userID, items, date.ToLongDateString());
            return itemsResult;
        }

        private async void SendDropOffDonationConfirmationEmail(int userID, List<DonationItem> items, string deliveryDate)
        {
            var email = _accountAccessor.FindUser(userID).Payload.Email;
            var itemNames = _donateAccessor.GetItemNames(items);
            await System.Threading.Tasks.Task.Run(() => _emailService.SendDropOffDonationConfirmationEmail(email, items, itemNames, deliveryDate));
        }

        public void FixItems()
        {
            _donateAccessor.FixItems();
        }

        public Result<List<DonationPreview>> GetRecentDonations(int userID, string languageName, string currencyCode)
        {
            return _donateAccessor.GetRecentDonations(userID, languageName, currencyCode);
        }

        public Result UpdateReadyItems()
        {
            try
            {
                var list = _donateAccessor.GetDonationsByStatus("Delivered");
                list = list.Concat(_donateAccessor.GetDonationsByStatus("Purchased")).ToList();
                var donateItems = _donateAccessor.GetDonateItems().Payload;
                foreach (var donationItem in list)
                {
                    var donateItem = donateItems.First(x => x.ItemID == donationItem.ItemID);
                    if (donationItem.NumberOfItems == null)
                    {
                        var campaignItem = _donateAccessor.GetCampaignItem(donateItem.ItemID).Payload;
                        campaignItem.ActualAmount += donationItem.TotalAmount;
                        _donateAccessor.UpdateCampaignItem(donateItem.ItemID, campaignItem.GoalAmount, campaignItem.ActualAmount, campaignItem.CurrencyID);
                    }
                    else
                    {
                        var inventoryItem = _inventoryAccessor.GetItem(donationItem.ItemID).Payload;
                        inventoryItem.ActualAmount += donationItem.NumberOfItems.Value;
                        _inventoryAccessor.UpdateInventoryItem(inventoryItem);

                        donateItem.Need = Math.Min(Math.Ceiling(inventoryItem.ActualAmount) / inventoryItem.GoalAmount, 1);
                    }
                    _donateAccessor.UpdateDonateItem(donateItem);
                }
                if(list.Count > 0)
                {
                    var donation = _donateAccessor.GetDonation(list[0].DonationID);
                    donation.StatusID = 3;
                    _donateAccessor.UpdateDonation(donation);
                }
                return new Result(true);
            }
            catch(Exception ex)
            {
                return new Result(false, ex.Message);
            }

        }
    }
}
