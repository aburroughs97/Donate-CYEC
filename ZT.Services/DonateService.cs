using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using ZT.Core.Models.Inventory;
using ZT.Data;

namespace ZT.Services
{
    public interface IDonateService
    {
        Result<List<Item>> GetAllItems(string languageName, string currencyCode);
        Result AddItem();
    }

    public class DonateService : IDonateService
    {
        private readonly IDonateAccessor _donateAccessor;
        private readonly IConfiguration _configuration;
        private readonly IInventoryAccessor _inventoryAccessor;

        public DonateService(IDonateAccessor donateAccessor,
                                IConfiguration configuration,
                                IInventoryAccessor inventoryAccessor)
        {
            _donateAccessor = donateAccessor;
            _configuration = configuration;
            _inventoryAccessor = inventoryAccessor;
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
                    ImagePath = x.ImagePath,
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
    }
}
