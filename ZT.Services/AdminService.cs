using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Account;
using ZT.Core.Models.Admin;
using ZT.Core.Models.Donate;
using ZT.Core.Models.Inventory;
using ZT.Data;

namespace ZT.Services
{
    public interface IAdminService
    {
        Result<List<User>> GetAllUsers();
        Result MakeUserAdmin(int userID);
        Result AddItem(AddItemRequest request);
        Result<ItemData> GetItemData(int itemID);
        Result UpdateItem(ItemData itemData);
        Result<List<DropOffDonationData>> GetDropOffDonations();
        Result MarkAsDelivered(int donationID);
        Result<List<PaymentDonationData>> GetPaymentDonations();
        Result MarkAsPurchased(int donationID);
        Result RemoveUndeliveredDropOffs();
    }
    public class AdminService : IAdminService
    {
        private readonly IAccountAccessor _accountAccessor;
        private readonly IDonateAccessor _donateAccessor;
        private readonly IInventoryAccessor _inventoryAccessor;
        private readonly ILanguageAndCurrencyAccessor _languageAndCurrencyAccessor;

        public AdminService(IAccountAccessor accountAccessor, 
                            IDonateAccessor donateAccessor, 
                            IInventoryAccessor inventoryAccessor, 
                            ILanguageAndCurrencyAccessor languageAndCurrencyAccessor)
        {
            _accountAccessor = accountAccessor;
            _donateAccessor = donateAccessor;
            _inventoryAccessor = inventoryAccessor;
            _languageAndCurrencyAccessor = languageAndCurrencyAccessor;
        }

        public Result AddItem(AddItemRequest request)
        {
            var currency = _languageAndCurrencyAccessor.GetCurrencyByCode(request.SelectedItemCurrency).Payload;
            var donateItem = new DonateItem
            {
                ItemType = request.SelectedItemType,
                Need = request.SelectedItemType == "direct" ? Math.Min(request.CurrentAmount.Value / request.GoalAmount.Value, 1) : request.Need.Value,
                Price = request.Price,
                CurrencyID = currency.CurrencyID
            };
            var donateItemResult = _donateAccessor.AddItem(donateItem);
            if (!donateItemResult.IsSuccess) return new Result(false, donateItemResult.Message);
            donateItem = donateItemResult.Payload;

            var engTitle = new DonateItemTitle
            {
                ItemID = donateItem.ItemID,
                LanguageID = 1,
                Title = request.EnglishName
            };
            _donateAccessor.AddItemTitle(engTitle);

            var swaTitle = new DonateItemTitle
            {
                ItemID = donateItem.ItemID,
                LanguageID = 2,
                Title = request.SwahiliName
            };
            _donateAccessor.AddItemTitle(swaTitle);

            var engDescription = new DonateItemDescription
            {
                ItemID = donateItem.ItemID,
                LanguageID = 1,
                Description = request.EnglishDescription
            };
            _donateAccessor.AddItemDescription(engDescription);

            var swaDescription = new DonateItemDescription
            {
                ItemID = donateItem.ItemID,
                LanguageID = 2,
                Description = request.SwahiliDescription
            };
            _donateAccessor.AddItemDescription(swaDescription);

            if (request.SelectedItemType == "direct")
            {
                var invItem = new InventoryItem
                {
                    ItemID = donateItem.ItemID,
                    ActualAmount = request.CurrentAmount.Value,
                    GoalAmount = (int)request.GoalAmount.Value,
                    AutoDecrement = request.AutoDecrement,
                    DecrementPerDay = request.DecrementPerDay
                };
                _inventoryAccessor.AddInventoryItem(invItem);
            }
            else
            {
                var campaignItem = new CampaignItem
                {
                    ItemID = donateItem.ItemID,
                    GoalAmount = (int)Math.Ceiling(request.Price),
                    ActualAmount = 0,
                    CurrencyID = currency.CurrencyID
                };
                _donateAccessor.AddCampaignItem(campaignItem);
            }

            var imageBase = request.ImageBase.Substring(request.ImageBase.IndexOf("base64,") + "base64,".Length);
            var imageBytes = Convert.FromBase64String(imageBase);

            //Add image here
            using (var stream = new MemoryStream())
            {
                using (Image<Rgba32> image = Image.Load(imageBytes))
                {
                    var width = Math.Min(image.Width, image.Height);
                    image.Mutate(x => x.Crop(width, width));
                    image.SaveAsJpeg(stream);
                }
                var bytes = stream.ToArray();
                var itemImage = new DonateItemImage
                {
                    ItemImageID = 0,
                    ItemID = donateItem.ItemID,
                    ImageData = bytes
                };
                _donateAccessor.AddImage(itemImage);
            }
            return new Result(true);
        }

        public Result<List<User>> GetAllUsers()
        {
            return _accountAccessor.GetAllUsers();
        }

        public Result MakeUserAdmin(int userID)
        {
            return _accountAccessor.MakeUserAdmin(userID);
        }

        public Result<ItemData> GetItemData(int itemID)
        {
            var itemDataResult = _donateAccessor.GetItemData(itemID);
            if (!itemDataResult.IsSuccess) return itemDataResult;
            var itemData = itemDataResult.Payload;

            if(itemData.SelectedItemType == "direct")
            {
                var invItem = _inventoryAccessor.GetItem(itemID).Payload;
                itemData.GoalAmount = invItem.GoalAmount;
                itemData.CurrentAmount = invItem.ActualAmount;
                itemData.AutoDecrement = invItem.AutoDecrement;
                itemData.DecrementPerDay = invItem.DecrementPerDay;
            }
            else
            {
                var campaignItem = _donateAccessor.GetCampaignItem(itemID).Payload;
                itemData.GoalAmount = campaignItem.GoalAmount;
                itemData.CurrentAmount = campaignItem.ActualAmount;
            }

            return new Result<ItemData>(itemData);
        }

        public Result UpdateItem(ItemData item)
        {
            var currency = _languageAndCurrencyAccessor.GetCurrencyByCode(item.SelectedItemCurrency).Payload;
            var donateItem = new DonateItem
            {
                ItemID = item.ItemID,
                ItemType = item.SelectedItemType,
                Need = item.SelectedItemType == "direct" ? Math.Min(item.CurrentAmount.Value / item.GoalAmount.Value, 1) : item.Need.Value,
                Price = item.Price,
                CurrencyID = currency.CurrencyID
            };
            _donateAccessor.UpdateDonateItem(donateItem);

            _donateAccessor.UpdateItemTitle(item.ItemID, 1, item.EnglishName);
            _donateAccessor.UpdateItemTitle(item.ItemID, 2, item.SwahiliName);

            _donateAccessor.UpdateItemDescription(item.ItemID, 1, item.EnglishDescription);
            _donateAccessor.UpdateItemDescription(item.ItemID, 2, item.SwahiliDescription);

            if (item.SelectedItemType == "direct")
            {
                _inventoryAccessor.UpdateInventoryItem(donateItem.ItemID, item.CurrentAmount.Value, item.GoalAmount.Value, item.AutoDecrement, item.DecrementPerDay.Value);
            }
            else
            {
                _donateAccessor.UpdateCampaignItem(item.ItemID, (int)Math.Ceiling(item.Price), item.CurrentAmount.Value, currency.CurrencyID);
            }

            //var imageBase = request.ImageBase.Substring(request.ImageBase.IndexOf("base64,") + "base64,".Length);
            //var imageBytes = Convert.FromBase64String(imageBase);

            ////Add image here...maybe
            //using (var stream = new MemoryStream())
            //{
            //    using (Image<Rgba32> image = Image.Load(imageBytes))
            //    {
            //        var width = Math.Min(image.Width, image.Height);
            //        image.Mutate(x => x.Crop(width, width));
            //        image.SaveAsJpeg(stream);
            //    }
            //    var bytes = stream.ToArray();
            //    var itemImage = new DonateItemImage
            //    {
            //        ItemImageID = 0,
            //        ItemID = donateItem.ItemID,
            //        ImageData = bytes
            //    };
            //    _donateAccessor.AddImage(itemImage);
            //}
            return new Result(true);
        }

        public Result<List<DropOffDonationData>> GetDropOffDonations()
        {
            return _donateAccessor.GetDropOffDonations();
        }

        public Result MarkAsDelivered(int donationID)
        {
            return _donateAccessor.MarkAsDelivered(donationID);
        }

        public Result<List<PaymentDonationData>> GetPaymentDonations()
        {
            return _donateAccessor.GetPaymentDonations();
        }

        public Result MarkAsPurchased(int donationID)
        {
            return _donateAccessor.MarkAsPurchased(donationID);
        }

        public Result RemoveUndeliveredDropOffs()
        {
            return _donateAccessor.RemoveUndeliveredDropOffs();
        }
    }
}
