using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ZT.Core.Models.Account;
using ZT.Services;

namespace ZT.Controllers
{
    public interface IAccountController
    {
        IActionResult CreateAccount([FromBody] RegisterRequest request);
    }

    [Route("api/Account")]
    public class AccountController : Controller, IAccountController
    {
        private readonly IAccountService _accountService;
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("CreateAccount")]
        public IActionResult CreateAccount([FromBody] RegisterRequest request)
        {
            var result = _accountService.CreateAccount(request);
            return Json(result);
        }

        [HttpPost("LogIn")]
        public IActionResult LogIn([FromBody] LogInRequest request)
        {
            var result = _accountService.LogIn(request);
            return Json(result);
        }

        [HttpPost("CreateAccessToken")]
        public IActionResult CreateAccessToken([FromBody] int userID)
        {
            var result = _accountService.CreateAccessToken(userID);
            return Json(result);
        }

        [HttpPost("ValidateAccessToken")]
        public IActionResult ValidateAccessToken([FromBody] ValidateAccessTokenRequest request)
        {
            var result = _accountService.ValidateAccessToken(request);
            return Json(result);
        }

        [HttpPost("RemoveAccessToken")]
        public IActionResult RemoveAccessToken([FromBody] ValidateAccessTokenRequest request)
        {
            _accountService.RemoveAccessToken(request);
            return Json(true);
        }

        [HttpPost("SendForgotPasswordEmail")]
        public IActionResult SendForgotPasswordEmail([FromBody] string email)
        {
            var result = _accountService.SendForgotPasswordEmail(email);
            return Json(result);
        }
    }
}