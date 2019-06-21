using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ZT.Core.Models.Donate;
using ZT.Services;

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

        [HttpGet("GetImages")]
        public IActionResult GetImages()
        {
            var result = _donateService.GetAllImages();
            return Json(result);
        }

        [HttpPost("AddItem")]
        public IActionResult AddItem()
        {
            var result = _donateService.AddItem();
            return Json(result);
        }
    }
}