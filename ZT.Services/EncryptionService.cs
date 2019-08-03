using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace ZT.Services
{
    public interface IEncryptionService
    {
        string CreateSaltKey(int size);
        string CreatePasswordHash(string password, string saltkey);
        string CreateHash(byte[] data, string hashAlgorithm);
        string GenerateMPESAPassword(string shortCode, string passKey, string timestamp);
    }

    public class EncryptionService : IEncryptionService
    {
        public IConfiguration _configuration;

        public EncryptionService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public virtual string CreateSaltKey(int size)
        {
            //generate a cryptographic random number
            using (var provider = new RNGCryptoServiceProvider())
            {
                var buff = new byte[size];
                provider.GetBytes(buff);

                // Return a Base64 string representation of the random number
                return Convert.ToBase64String(buff);
            }
        }

        /// <summary>
        /// Create a password hash
        /// </summary>
        /// <param name="password">Password</param>
        /// <param name="saltkey">Salk key</param>
        /// <param name="passwordFormat">Password format (hash algorithm)</param>
        /// <returns>Password hash</returns>
        public virtual string CreatePasswordHash(string password, string saltkey)
        {
            return CreateHash(Encoding.UTF8.GetBytes(string.Concat(password, saltkey)), _configuration["HashCode"]);
        }

        /// <summary>
        /// Create a data hash
        /// </summary>
        /// <param name="data">The data for calculating the hash</param>
        /// <param name="hashAlgorithm">Hash algorithm</param>
        /// <returns>Data hash</returns>
        public virtual string CreateHash(byte[] data, string hashAlgorithm)
        {
            if (string.IsNullOrEmpty(hashAlgorithm))
                throw new ArgumentNullException(nameof(hashAlgorithm));

            var algorithm = (HashAlgorithm)CryptoConfig.CreateFromName(hashAlgorithm);
            if (algorithm == null)
                throw new ArgumentException("Unrecognized hash name");

            var hashByteArray = algorithm.ComputeHash(data);
            return BitConverter.ToString(hashByteArray).Replace("-", string.Empty);
        }

        public string GenerateMPESAPassword(string shortCode, string passKey, string timestamp)
        {
            var pass = (shortCode + passKey + timestamp).Select(x => (byte)x).ToArray();
            return Convert.ToBase64String(pass);
        }
    }
}
