using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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
    }
}