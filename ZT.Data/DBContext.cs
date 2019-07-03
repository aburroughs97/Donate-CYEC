﻿using System;
using System.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using ZT.Core.Models.Account;
using ZT.Core.Models.Currency;
using ZT.Core.Models.Donate;
using ZT.Core.Models.Inventory;
using ZT.Core.Models.Language;

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
        public virtual DbSet<Language> Language { get; set; }
        public virtual DbSet<Currency> Currency { get; set; }
        public virtual DbSet<DonateItem> DonateItem { get; set; }
        public virtual DbSet<DonateItemTitle> DonateItemTitle { get; set; }
        public virtual DbSet<DonateItemDescription> DonateItemDescription {get; set;}
        public virtual DbSet<InventoryItem> InventoryItem { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.UserID).HasColumnType("int(11)");

                entity.Property(e => e.Email).HasColumnType("varchar(100)");

                entity.Property(e => e.FirstName).HasColumnType("varchar(50)");

                entity.Property(e => e.LastName).HasColumnType("varchar(50)");

                entity.Property(e => e.IsAdmin).HasColumnType("bit");

                entity.Property(e => e.LanguageID).HasColumnType("int(11)");

                entity.Property(e => e.CurrencyID).HasColumnType("int(11)");
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

            modelBuilder.Entity<Language>(entity =>
            {
                entity.Property(e => e.LanguageID).HasColumnType("int(11)");

                entity.Property(e => e.LanguageCode).HasColumnType("char(3)");

                entity.Property(e => e.LanguageName).HasColumnType("varchar(25)");
            });

            modelBuilder.Entity<Currency>(entity =>
            {
                entity.Property(e => e.CurrencyID).HasColumnType("int(11)");

                entity.Property(e => e.Name).HasColumnType("varchar(25)");

                entity.Property(e => e.Code).HasColumnType("char(3)");

                entity.Property(e => e.ConversionRateFromUSD).HasColumnType("decimal(10, 2)");

                entity.Property(e => e.RoundDigits).HasColumnType("int(11)");

                entity.Property(e => e.CurrencySymbol).HasColumnType("char(3)");

                entity.Property(e => e.SymbolBefore).HasColumnType("bit");
            });

            modelBuilder.Entity<DonateItem>(entity =>
            {
                entity.Property(e => e.ItemID).HasColumnType("int(11)");

                entity.Property(e => e.ItemType).HasColumnType("varchar(10)");


                entity.Property(e => e.Price).HasColumnType("decimal");

                entity.Property(e => e.Need).HasColumnType("decimal");

                entity.Property(e => e.IsDeleted).HasColumnType("bit");

                entity.HasKey(e => e.ItemID);
            });

            modelBuilder.Entity<DonateItemTitle>(entity =>
            {
                entity.Property(e => e.ItemTitleID).HasColumnType("int(11)");

                entity.Property(e => e.ItemID).HasColumnType("int(11)");

                entity.Property(e => e.LanguageID).HasColumnType("int(11)");

                entity.Property(e => e.Title).HasColumnType("varchar(255)");

                entity.HasKey(e => e.ItemTitleID);
            });

            modelBuilder.Entity<DonateItemDescription>(entity =>
            {
                entity.Property(e => e.ItemDescriptionID).HasColumnType("int(11)");

                entity.Property(e => e.ItemID).HasColumnType("int(11)");

                entity.Property(e => e.LanguageID).HasColumnType("int(11)");

                entity.Property(e => e.Description).HasColumnType("varchar(1000)");

                entity.HasKey(e => e.ItemDescriptionID);
            });

            modelBuilder.Entity<InventoryItem>(entity =>
            {
                entity.Property(e => e.InventoryItemID).HasColumnType("int(11)");

                entity.Property(e => e.ItemID).HasColumnType("int(11)");

                entity.Property(e => e.ActualAmount).HasColumnType("decimal(10,2)");

                entity.Property(e => e.GoalAmount).HasColumnType("int(11)");

                entity.Property(e => e.AutoDecrement).HasColumnType("bit");

                entity.Property(e => e.DecrementPerDay).HasColumnType("decimal(10,4)");

                entity.Property(e => e.IsDeleted).HasColumnType("bit");

                entity.HasKey(e => e.InventoryItemID);
            });
        }
    }
}
