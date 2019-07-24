using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ZT.Core.Models.Donate;
using ZT.Services;
using System.Net;

namespace ZT.Controllers
{
    [Route("api/Donate")]
    public class DonateController : Controller
    {
        private readonly IDonateService _donateService;
        public DonateController(IDonateService donateService)
        {
            _donateService = donateService;
        }

        [HttpGet("GetItems")]
        public IActionResult GetItems(string languageName, string currencyCode)
        {
            var result = _donateService.GetAllItems(languageName, currencyCode);
            return Json(result);
        }

        [HttpGet("GetItem")]
        public IActionResult GetItem(int itemID, string languageName, string currencyCode)
        {
            var result = _donateService.GetItem(itemID, languageName, currencyCode);
            return Json(result);
        }

        [HttpPost("AddItem")]
        public IActionResult AddItem()
        {
            var result = _donateService.AddItem();
            return Json(result);
        }

        [HttpPost("AddImage")]
        public IActionResult AddImage()
        {
            _donateService.AddImages();
            return Json(true);
        }

        [HttpGet("GetImage")]
        public IActionResult GetImage(int itemID)
        {
            var result = _donateService.GetImage(itemID);
            if(result.IsSuccess)
            {
                return File(result.Payload.ImageData, "image/jpeg");
            }
            return Json(false);
        }

        [HttpGet("LoadCart")]
        public IActionResult LoadCart(int userID, string languageName, string currencyCode)
        {
            var result = _donateService.LoadCart(userID, languageName, currencyCode);
            return Json(result);
        }

        [HttpGet("CheckCart")]
        public IActionResult CheckCart(int userID)
        {
            var result = _donateService.CheckCart(userID);
            return Json(result);
        }

        [HttpGet("AddToCart")]
        public IActionResult AddToCart(int userID, int itemID, decimal totalAmount, int? numItems)
        {
            var result = _donateService.AddToCart(userID, itemID, totalAmount, numItems);
            return Json(result);
        }

        [HttpPost("UpdateCartItem")]
        public IActionResult UpdateCartItem([FromBody]CartItem item)
        {
            var result = _donateService.UpdateCartItem(item);
            return Json(result);
        }

        [HttpGet("RemoveCartItem")]
        public IActionResult RemoveCartItem(int userID, int itemID)
        {
            var result = _donateService.RemoveCartItem(userID, itemID);
            return Json(result);
        }

        [HttpGet("MakeDropOffDonation")]
        public IActionResult MakeDropOffDonation(int userID, DateTime deliveryDate)
        {
            var result = _donateService.MakeDropOffDonation(userID, deliveryDate);
            return Json(result);
        }

        [HttpGet("FixItems")]
        public IActionResult FixItems()
        {
            _donateService.FixItems();
            return Json(true);
        }
    }
}