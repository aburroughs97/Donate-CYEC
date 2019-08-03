using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ZT.Core.Models.Admin;
using ZT.Services;

namespace ZT.Controllers
{
    [Route("api/Admin")]
    public class AdminController : Controller
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("GetAllUsers")]
        public IActionResult GetAllUsers()
        {
            var result = _adminService.GetAllUsers();
            return Json(result);
        }

        [HttpGet("MakeUserAdmin")]
        public IActionResult MakeUserAdmin(int userID)
        {
            var result = _adminService.MakeUserAdmin(userID);
            return Json(result);
        }

        [HttpPost("AddItem")]
        public IActionResult AddItem([FromBody] AddItemRequest request)
        {
            var result = _adminService.AddItem(request);
            return Json(result);
        }

        [HttpGet("GetItemData")]
        public IActionResult GetItemData(int itemID)
        {
            var result = _adminService.GetItemData(itemID);
            return Json(result);
        }

        [HttpPost("UpdateItem")]
        public IActionResult UpdateItem([FromBody] ItemData itemData)
        {
            var result = _adminService.UpdateItem(itemData);
            return Json(result);
        }

        [HttpGet("GetDropOffDonations")]
        public IActionResult GetDropOffDonations()
        {
            var result = _adminService.GetDropOffDonations();
            return Json(result);
        }

        [HttpGet("MarkAsDelivered")]
        public IActionResult MarkAsDelivered(int donationID)
        {
            var result = _adminService.MarkAsDelivered(donationID);
            return Json(result);
        }

        [HttpGet("GetPaymentDonations")]
        public IActionResult GetPaymentDonations()
        {
            var result = _adminService.GetPaymentDonations();
            return Json(result);
        }

        [HttpGet("MarkAsPurchased")]
        public IActionResult MarkAsPurchased(int donationID)
        {
            var result = _adminService.MarkAsPurchased(donationID);
            return Json(result);
        }
    }
}