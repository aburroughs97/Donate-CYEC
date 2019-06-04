using Microsoft.AspNetCore.Mvc;
using ZT.Core.Models.Account;
using ZT.Services;

namespace ZT.Controllers
{
    public interface ILoginController
    {
        IActionResult CreateAccount([FromBody] RegisterRequest request);
    }

    [Route("api/Login")]
    public class LoginController : Controller, ILoginController
    {
        private readonly ILoginService _loginService;
        public LoginController(ILoginService loginService)
        {
            _loginService = loginService;
        }

        [HttpPost("CreateAccount")]
        public IActionResult CreateAccount([FromBody] RegisterRequest request)
        {
            var result = _loginService.CreateAccount(request);
            return Json(result);
        }

        [HttpPost("LogIn")]
        public IActionResult LogIn([FromBody] LogInRequest request)
        {
            var result = _loginService.LogIn(request);
            return Json(result);
        }

        [HttpPost("CreateAccessToken")]
        public IActionResult CreateAccessToken([FromBody] int userID)
        {
            var result = _loginService.CreateAccessToken(userID);
            return Json(result);
        }

        [HttpPost("ValidateAccessToken")]
        public IActionResult ValidateAccessToken([FromBody] ValidateAccessTokenRequest request)
        {
            var result = _loginService.ValidateAccessToken(request);
            return Json(result);
        }

        [HttpPost("RemoveAccessToken")]
        public IActionResult RemoveAccessToken([FromBody] ValidateAccessTokenRequest request)
        {
            _loginService.RemoveAccessToken(request);
            return Json(true);
        }

        [HttpPost("SendForgotPasswordEmail")]
        public IActionResult SendForgotPasswordEmail([FromBody] string email)
        {
            var result = _loginService.SendForgotPasswordEmail(email);
            return Json(result);
        }

        [HttpPost("ValidateForgotPasswordToken")]
        public IActionResult ValidateForgotPasswordToken([FromBody] ValidateForgotPasswordTokenRequest request)
        {
            var result = _loginService.ValidateForgotPasswordToken(request);
            return Json(result);
        }

        [HttpPost("ChangePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var result = _loginService.ChangePassword(request);
            return Json(result);
        }
    }
}