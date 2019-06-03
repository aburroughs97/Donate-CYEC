using System;
using System.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using ZT.Core.Models.Account;

namespace ZT.Data
{
    public partial class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<UserPassword> UserPassword { get; set; }
        public virtual DbSet<UserSession> UserSession { get; set; }
        public virtual DbSet<UserPasswordReset> UserPasswordReset { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.UserID).HasColumnType("int(11)");

                entity.Property(e => e.Email).HasColumnType("varchar(100)");

                entity.Property(e => e.FirstName).HasColumnType("varchar(50)");

                entity.Property(e => e.LastName).HasColumnType("varchar(50)");

                entity.Property(e => e.IsAdmin).HasColumnType("bit");
            });

            modelBuilder.Entity<UserPassword>(entity =>
            {
                entity.Property(e => e.UserPasswordID).HasColumnType("int(11)");

                entity.Property(e => e.CreatedOnUtc).HasColumnType("datetime");

                entity.Property(e => e.Password).HasColumnType("char(128)");

                entity.Property(e => e.PasswordSalt).HasColumnType("char(5)");

                entity.Property(e => e.UserID).HasColumnType("int(11)");
            });

            modelBuilder.Entity<UserSession>(entity =>
            {
               entity.Property(e => e.UserSessionID).HasColumnType("int(11)");

                entity.Property(e => e.UserID).HasColumnType("int(11)");

                entity.Property(e => e.AccessToken).HasColumnType("char(128)");

                entity.Property(e => e.ExpiresOn).HasColumnType("datetime");
            });

            modelBuilder.Entity<UserPasswordReset>(entity =>
            {
                entity.Property(e => e.UserPasswordResetID).HasColumnType("int(11)");

                entity.Property(e => e.UserID).HasColumnType("int(11)");

                entity.Property(e => e.ResetCode).HasColumnType("char(128)");

                entity.Property(e => e.CreatedOn).HasColumnType("datetime");
            });
        }
    }
}
