using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;

namespace WanderVN.Infrastructure.Data;

public partial class WanderVNDbContext : DbContext
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
    public virtual DbSet<Rooms> Rooms { get; set; }
    public virtual DbSet<TourImages> TourImages { get; set; }
    public virtual DbSet<Tours> Tours { get; set; }
    public virtual DbSet<Users> Users { get; set; }
    public virtual DbSet<Wishlists> Wishlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string will be managed via Dependency Injection in Program.cs
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WanderVNDbContext).Assembly);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
