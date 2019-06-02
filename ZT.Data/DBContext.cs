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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.CustomerGuid)
                    .HasName("CustomerGUID")
                    .IsUnique();

                entity.Property(e => e.UserID)
                    .HasColumnName("UserID")
                    .HasColumnType("int(11)");

                entity.Property(e => e.CustomerGuid)
                    .IsRequired()
                    .HasColumnName("CustomerGUID")
                    .HasColumnType("char(36)");

                entity.Property(e => e.Email).HasColumnType("varchar(100)");

                entity.Property(e => e.FirstName).HasColumnType("varchar(50)");

                entity.Property(e => e.LastName).HasColumnType("varchar(50)");
            });

            modelBuilder.Entity<UserPassword>(entity =>
            {
                entity.HasIndex(e => e.UserID)
                    .HasName("UserID");

                entity.Property(e => e.UserPasswordID)
                    .HasColumnName("UserPasswordID")
                    .HasColumnType("int(11)");

                entity.Property(e => e.CreatedOnUtc)
                    .HasColumnName("CreatedOnUTC")
                    .HasColumnType("datetime");

                entity.Property(e => e.Password).HasColumnType("char(128)");

                entity.Property(e => e.PasswordSalt).HasColumnType("char(5)");

                entity.Property(e => e.UserID)
                    .HasColumnName("UserID")
                    .HasColumnType("int(11)");
            });

            modelBuilder.Entity<UserSession>(entity =>
            {
               entity.Property(e => e.UserSessionID)
                    .HasColumnName("UserSessionID")
                    .HasColumnType("int(11)");

                entity.Property(e => e.UserID)
                    .HasColumnName("UserID")
                    .HasColumnType("int(11)");

                entity.Property(e => e.AccessToken).HasColumnType("varchar(255)");

                entity.Property(e => e.ExpiresOn).HasColumnType("datetime");
            });
        }
    }
}
