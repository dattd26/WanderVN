using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Airlines> Airlines { get; }
    DbSet<Airports> Airports { get; }
    DbSet<Amenities> Amenities { get; }
    DbSet<BookingFlights> BookingFlights { get; }
    DbSet<BookingHotels> BookingHotels { get; }
    DbSet<Bookings> Bookings { get; }
    DbSet<ChatLogs> ChatLogs { get; }
    DbSet<Flights> Flights { get; }
    DbSet<HotelImages> HotelImages { get; }
    DbSet<Hotels> Hotels { get; }
    DbSet<Locations> Locations { get; }
    DbSet<Payments> Payments { get; }
    DbSet<Roles> Roles { get; }
    DbSet<RoomTypeImages> RoomTypeImages { get; }
    DbSet<RoomTypes> RoomTypes { get; }
    DbSet<Rooms> Rooms { get; }
    DbSet<Users> Users { get; }
    DbSet<Wishlists> Wishlists { get; }
    DbSet<PropertyTypes> PropertyTypes { get; }
    DbSet<RatePlans> RatePlans { get; }
    DbSet<HomeTravelMoods> HomeTravelMoods { get; }
    DbSet<HomeEditorialDestinations> HomeEditorialDestinations { get; }
    DbSet<HomeWeekendEscapes> HomeWeekendEscapes { get; }
    DbSet<HomeStayCollections> HomeStayCollections { get; }
    DbSet<HotelTravelMoods> HotelTravelMoods { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
