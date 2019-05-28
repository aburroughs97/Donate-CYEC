using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Data
{
    public static class IServiceCollectionExtension
    {
        public static IServiceCollection AddData(this IServiceCollection services)
        {
            services.AddTransient<IAccountAccessor, AccountAccessor>();
            return services;
        }
    }
}
