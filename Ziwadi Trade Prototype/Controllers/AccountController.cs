using Microsoft.AspNetCore.Mvc;
using ZT.Core.Models.Account;
using ZT.Services;

namespace ZT.Controllers
{
    [Route("api/Account")]
    public class AccountController : Controller
    {
        private readonly IAccountService _accountService;
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet("GetUser")]
        public IActionResult GetUser(int userID)
        {
            var result = _accountService.GetUser(userID);
            return Json(result);
        }

        [HttpGet("UpdateUser")]
        public IActionResult UpdateUser(int userID, string firstName, string lastName)
        {
            var result = _accountService.UpdateUser(userID, firstName, lastName);
            return Json(result);
        }

        [HttpGet("ChangePassword")]
        public IActionResult ChangePassword(int userID, string currentPassword, string newPassword)
        {
            var result = _accountService.ChangePassword(userID, currentPassword, newPassword);
            return Json(result);
        }

        [HttpGet("UpdateLanguageAndCurrency")]
        public IActionResult UpdateLanguageAndCurrency(int userID, string languageName, string currencyCode)
        {
            var result = _accountService.UpdateLanguageAndCurrency(userID, languageName, currencyCode);
            return Json(result);
        }

        [HttpGet("GetLanguages")]
        public IActionResult GetLanguages()
        {
            var result = _accountService.GetLanguages();
            return Json(result);
        }

        [HttpGet("GetCurrencies")]
        public IActionResult GetCurrencies()
        {
            var result = _accountService.GetCurrencies();
            return Json(result);
        }
    }
}