using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Services
{
    public static class IServiceCollectionExtension
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddTransient<IEncryptionService, EncryptionService>();
            services.AddTransient<IAccountService, AccountService>();
            return services;
        }
    }
}
