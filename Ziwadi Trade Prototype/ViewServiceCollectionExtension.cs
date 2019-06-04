using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using ZT.Controllers;

namespace ZT.Data
{
    public static class IServiceCollectionExtension
    {
        public static IServiceCollection AddView(this IServiceCollection services)
        {
            services.AddTransient<ILoginController, LoginController>();
            return services;
        }
    }
}
