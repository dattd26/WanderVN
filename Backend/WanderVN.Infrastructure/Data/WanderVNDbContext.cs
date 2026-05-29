using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Infrastructure.Data;

public partial class WanderVNDbContext : DbContext, IApplicationDbContext
{
    public WanderVNDbContext()
    {
    }

    public WanderVNDbContext(DbContextOptions<WanderVNDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Airlines> Airlines { get; set; }
    public virtual DbSet<Airports> Airports { get; set; }
    public virtual DbSet<Amenities> Amenities { get; set; }
    public virtual DbSet<BookingFlights> BookingFlights { get; set; }
    public virtual DbSet<BookingHotels> BookingHotels { get; set; }
    public virtual DbSet<Bookings> Bookings { get; set; }
    public virtual DbSet<ChatLogs> ChatLogs { get; set; }
    public virtual DbSet<Flights> Flights { get; set; }
    public virtual DbSet<HotelImages> HotelImages { get; set; }
    public virtual DbSet<Hotels> Hotels { get; set; }
    public virtual DbSet<Locations> Locations { get; set; }
    public virtual DbSet<Payments> Payments { get; set; }
    public virtual DbSet<Roles> Roles { get; set; }
    public virtual DbSet<RoomTypeImages> RoomTypeImages { get; set; }
    public virtual DbSet<RoomTypes> RoomTypes { get; set; }
    public virtual DbSet<RatePlans> RatePlans { get; set; }
    public virtual DbSet<Rooms> Rooms { get; set; }
    public virtual DbSet<Users> Users { get; set; }
    public virtual DbSet<Wishlists> Wishlists { get; set; }
    public virtual DbSet<PropertyTypes> PropertyTypes { get; set; }
    public virtual DbSet<PartnerPayouts> PartnerPayouts { get; set; }
    public virtual DbSet<HomeTravelMoods> HomeTravelMoods { get; set; }
    public virtual DbSet<HomeEditorialDestinations> HomeEditorialDestinations { get; set; }
    public virtual DbSet<HomeWeekendEscapes> HomeWeekendEscapes { get; set; }
    public virtual DbSet<HomeStayCollections> HomeStayCollections { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string will be managed via Dependency Injection in Program.cs
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WanderVNDbContext).Assembly);

        modelBuilder.Entity<Flights>(entity =>
        {
            entity.HasOne(f => f.ArrAirport)
                .WithMany(a => a.FlightsArrAirport)
                .HasForeignKey(f => f.ArrAirportId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(f => f.DepAirport)
                .WithMany(a => a.FlightsDepAirport)
                .HasForeignKey(f => f.DepAirportId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            // Cấu hình kiểu decimal cho Price của chuyến bay
            entity.Property(f => f.Price).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<Roles>().HasData(
            new Roles { Id = 1, Name = "Admin" },
            new Roles { Id = 2, Name = "User" }
        );

        modelBuilder.Entity<Users>(entity =>
        {
            // KHÔNG cấu hình HasDefaultValue/HasDefaultValueSql cho Status.
            // Lý do: EF Core dùng CLR default (0) làm sentinel — nếu set Status=0 (Pending),
            // nó sẽ bỏ qua và để DB dùng DEFAULT(1). Bỏ cấu hình này để EF Core
            // luôn gửi giá trị Status được gán trong code xuống DB.
            entity.Property(u => u.Status).HasColumnType("int");
        });

        modelBuilder.Entity<Hotels>(entity =>
        {
            // Thiết lập mối quan hệ 1-N giữa Users (Chủ sở hữu) và Hotels (Khách sạn)
            entity.HasOne(h => h.Owner)
                .WithMany(u => u.Hotels)
                .HasForeignKey(h => h.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Thiết lập mối quan hệ 1-N giữa PropertyTypes (Loại hình lưu trú) và Hotels
            entity.HasOne(h => h.PropertyType)
                .WithMany(p => p.Hotels)
                .HasForeignKey(h => h.PropertyTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình kiểu decimal cho Latitude và Longitude của khách sạn
            entity.Property(h => h.Latitude).HasColumnType("decimal(9, 6)");
            entity.Property(h => h.Longitude).HasColumnType("decimal(9, 6)");
        });

        modelBuilder.Entity<Rooms>(entity =>
        {
            // Thiết lập mối quan hệ 1-N giữa Hotels (Khách sạn) và Rooms (Phòng)
            entity.HasOne(r => r.Hotel)
                .WithMany(h => h.Rooms)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            // Thiết lập mối quan hệ 1-N (nullable) giữa RoomTypes (Loại phòng) và Rooms (Phòng)
            entity.HasOne(r => r.RoomType)
                .WithMany(rt => rt.Rooms)
                .HasForeignKey(r => r.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PropertyTypes>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Locations>(entity =>
        {
            // Thiết lập mối quan hệ tự liên kết cấp bậc địa phương
            entity.HasOne(l => l.Parent)
                .WithMany(p => p.InverseParent)
                .HasForeignKey(l => l.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình kiểu decimal cho Latitude và Longitude của địa điểm
            entity.Property(l => l.Latitude).HasColumnType("decimal(9, 6)");
            entity.Property(l => l.Longitude).HasColumnType("decimal(9, 6)");
        });

        // Cấu hình kiểu decimal cho các thuộc tính tiền tệ của các thực thể khác
        modelBuilder.Entity<Bookings>(entity =>
        {
            entity.Property(b => b.TotalPrice).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<Payments>(entity =>
        {
            entity.Property(p => p.Amount).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<RoomTypes>(entity =>
        {
            entity.Property(r => r.BasePrice).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<RatePlans>(entity =>
        {
            entity.HasOne(rp => rp.RoomType)
                .WithMany(rt => rt.RatePlans)
                .HasForeignKey(rp => rp.RoomTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(rp => rp.PriceMultiplier).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<PartnerPayouts>(entity =>
        {
            entity.ToTable("PartnerPayouts");
            entity.HasKey(e => e.Id);

            entity.HasOne(p => p.Partner)
                .WithMany(u => u.PartnerPayouts)
                .HasForeignKey(p => p.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Booking)
                .WithMany(b => b.PartnerPayouts)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HomeTravelMoods>(entity =>
        {
            entity.ToTable("HomeTravelMoods");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IconName).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.ImageUrl).HasMaxLength(500).IsUnicode(false);
            entity.Property(e => e.QueryString).HasMaxLength(255).IsUnicode(false);
        });

        modelBuilder.Entity<HomeEditorialDestinations>(entity =>
        {
            entity.ToTable("HomeEditorialDestinations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.Tags).HasMaxLength(255);
            entity.Property(e => e.ImageUrl).HasMaxLength(500).IsUnicode(false);
            entity.Property(e => e.BestTime).HasMaxLength(100);
            entity.Property(e => e.Experience).HasMaxLength(255);

            entity.HasOne(d => d.Location)
                .WithMany()
                .HasForeignKey(d => d.LocationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HomeWeekendEscapes>(entity =>
        {
            entity.ToTable("HomeWeekendEscapes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Origin).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.Duration).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.ImageUrl).HasMaxLength(500).IsUnicode(false);

            entity.HasOne(e => e.Location)
                .WithMany()
                .HasForeignKey(e => e.LocationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HomeStayCollections>(entity =>
        {
            entity.ToTable("HomeStayCollections");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ImageUrl).HasMaxLength(500).IsUnicode(false);
            entity.Property(e => e.QueryString).HasMaxLength(255).IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
