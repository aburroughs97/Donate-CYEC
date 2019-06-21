using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using ZT.Core;
using ZT.Core.Models.Donate;
using ZT.Data;

namespace ZT.Services
{
    public interface IDonateService
    {
        Result<List<Item>> GetAllItems(string languageName, string currencyCode);
        Result<List<DonateItemImage>> GetAllImages();
        Result AddItem();
    }

    public class DonateService : IDonateService
    {
        private readonly IDonateAccessor _donateAccessor;
        private readonly IConfiguration _configuration;

        public DonateService(IDonateAccessor donateAccessor,
                                IConfiguration configuration)
        {
            _donateAccessor = donateAccessor;
            _configuration = configuration;
        }

        public Result<List<Item>> GetAllItems(string languageName, string currencyCode)
        {
            return _donateAccessor.GetAllItems(languageName, currencyCode);
        }

        public Result<List<DonateItemImage>> GetAllImages()
        {
            return _donateAccessor.GetAllImages();
        }

        public Result AddItem()
        {
            var item = new DonateItem
            {
                ItemType = "direct",
                Title = "",
                Price = 0M,
                Need = 0M,
                IsDeleted = false
            };
            var itemResult = _donateAccessor.AddItem(item);
            if (!itemResult.IsSuccess) return new Result(false, itemResult.Message);
            item = itemResult.Payload;

            var itemDescription = new DonateItemDescription
            {
                ItemID = item.ItemID,
                LanguageID = 1,
                Description = "",
            };
            var descriptionResult = _donateAccessor.AddItemDescription(itemDescription);
            if (!descriptionResult.IsSuccess)
            {
                return new Result(false, descriptionResult.Message);
            }
            //var img = Image.FromFile("");

            var itemImage = new DonateItemImage
            {
                ItemID = item.ItemID,
                ImageBase = ""
            };

            var imageResult = _donateAccessor.AddItemImage(itemImage);
            if(!imageResult.IsSuccess)
            {
                return new Result(false, imageResult.Message);
            }

            return new Result(true);
        }
    }
}
