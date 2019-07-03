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
            services.AddTransient<ILoginService, LoginService>();
            services.AddTransient<IAccountService, AccountService>();
            services.AddTransient<IAdminService, AdminService>();
            services.AddTransient<IDonateService, DonateService>();
            services.AddTransient<ILanguageAndCurrencyService, LanguageAndCurrencyService>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IInventoryManager, InventoryManager>();
            return services;
        }
    }
}
