using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ZT.Core;
using ZT.Services;

namespace Ziwadi_Trade_Prototype.Controllers
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        WeatherFinder _finder = new WeatherFinder();

        [HttpGet("[action]")]
        public IEnumerable<WeatherForecast> WeatherForecasts()
        {
            return _finder.WeatherForecasts();
        }

        
    }
}
