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
        Result AddItem();
        Result<DonateItemImage> GetImage(int itemID);
        void AddImages();
        Result<List<CartItem>> LoadCart(int userID, string languageName, string currencyCode);
        int CheckCart(int userID);
        Result<int> AddToCart(int userID, int itemID, decimal totalAmount, int? numItems);
        Result UpdateCartItem(CartItem item);
        Result RemoveCartItem(int userID, int itemID);
        Result MakeDropOffDonation(int userID, DateTime date);
        void FixItems();
        Result<List<DonationPreview>> GetRecentDonations(int userID, string languageName, string currencyCode);
        Result UpdateDeliveredItems();
    }

    public class DonateService : IDonateService
    {
        private readonly IDonateAccessor _donateAccessor;
        private readonly IConfiguration _configuration;
        private readonly IInventoryAccessor _inventoryAccessor;
        private readonly IEmailService _emailService;
        private readonly IAccountAccessor _accountAccessor;

        public DonateService(IDonateAccessor donateAccessor,
                                IConfiguration configuration,
                                IInventoryAccessor inventoryAccessor,
                                IEmailService emailService,
                                IAccountAccessor accountAccessor)
        {
            _donateAccessor = donateAccessor;
            _configuration = configuration;
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
            return new Result<List<Item>>(newList.Concat(list.Where(x => x.ItemType != "direct")).OrderBy(x => x.Need).ToList());
        }

        public Result AddItem()
        {
            var names = new string[] { "Test Fund"};
            foreach(var name in names)
            {
                var rand = new Random();

                var item = new DonateItem
                {
                    ItemType = "sponsor",
                    Price = 1500M,
                    Need = .45M,
                    IsDeleted = false
                };
                var itemResult = _donateAccessor.AddItem(item);
                if (!itemResult.IsSuccess) return new Result(false, itemResult.Message);
                item = itemResult.Payload;


                var itemTitle = new DonateItemTitle
                {
                    ItemID = item.ItemID,
                    LanguageID = 1,
                    Title = "Help Alex Pay For School"
                };
                var itemTitle2 = new DonateItemTitle
                {
                    ItemID = item.ItemID,
                    LanguageID = 2,
                    Title = "S-Help Alex Pay For School"
                };
                _donateAccessor.AddItemTitle(itemTitle);
                _donateAccessor.AddItemTitle(itemTitle2);

                var itemDescription = new DonateItemDescription
                {
                    ItemID = item.ItemID,
                    LanguageID = 1,
                    Description = "Alex is an aspiring computer scientist studying at Kansas State University. He has always been passionate about international service" +
                                    " and is currently spending his summer in Kenya. By giving, you can help Alex achieve his dream of completing his study at K-State.",
                };
                var itemDescription2 = new DonateItemDescription
                {
                    ItemID = item.ItemID,
                    LanguageID = 2,
                    Description = "This is a Swahili description."
                };
                _donateAccessor.AddItemDescription(itemDescription);
                _donateAccessor.AddItemDescription(itemDescription2);

                var imageBase = "";
                var m = new ImageFormatManager();
                var dir = Directory.GetParent(Environment.CurrentDirectory) + "\\Ziwadi Trade Prototype\\ClientApp\\src\\media\\Samples\\";
                using (Image<Rgba32> image = Image.Load(dir + "Alex.jpg"))
                {
                    var width = Math.Min(image.Width, image.Height);
                    image.Mutate(x => x.Crop(width, width));
                    imageBase = image.ToBase64String(Image.DetectFormat(dir + "Alex.jpg"));
                }

                //Add to filesystem
            }


            return new Result(true);
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

        public Result<int> AddToCart(int userID, int itemID, decimal totalAmount, int? numItems)
        {
            var item = new DonateCartItem
            {
                UserID = userID,
                ItemID = itemID,
                TotalAmount = totalAmount,
                NumItems = numItems
            };
            return _donateAccessor.AddToCart(item);
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

        public Result MakeDropOffDonation(int userID, DateTime date)
        {
            var cartItems = _donateAccessor.GetCartItems(userID).Payload;

            var total = cartItems.Sum(x => x.TotalAmount);

            var donationResult = _donateAccessor.MakeDonation(userID, total, "dropoff");
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
                NumberOfItems = x.NumItems
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

        public Result UpdateDeliveredItems()
        {
            try
            {
                var list = _donateAccessor.GetDonationsByStatus("Delivered");
                var donateItems = _donateAccessor.GetDonateItems().Payload;
                foreach (var donationItem in list)
                {
                    var donateItem = donateItems.First(x => x.ItemID == donationItem.ItemID);
                    if (donationItem.NumberOfItems == null)
                    {
                        var amount = ((donateItem.Need - .5M) * 2) * donateItem.Price;
                        amount += donationItem.TotalAmount;
                        donateItem.Need = ((amount / donateItem.Price) / 2) + .5M;
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
