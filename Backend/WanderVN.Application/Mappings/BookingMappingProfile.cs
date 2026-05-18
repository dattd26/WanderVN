using AutoMapper;
using WanderVN.Application.DTOs.Bookings;
using WanderVN.Application.DTOs.Payments;
using WanderVN.Application.DTOs.ChatLogs;
using WanderVN.Application.DTOs.Wishlists;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Mappings;

public class BookingMappingProfile : Profile
{
    public BookingMappingProfile()
    {
        // Bookings
        CreateMap<Bookings, BookingResponseDto>().ReverseMap();
        CreateMap<BookingRequestDto, Bookings>();

        // Booking Flights
        CreateMap<BookingFlights, BookingFlightResponseDto>().ReverseMap();
        CreateMap<BookingFlightRequestDto, BookingFlights>();

        // Booking Hotels
        CreateMap<BookingHotels, BookingHotelResponseDto>().ReverseMap();
        CreateMap<BookingHotelRequestDto, BookingHotels>();

        // Payments
        CreateMap<Payments, PaymentResponseDto>().ReverseMap();
        CreateMap<PaymentRequestDto, Payments>();

        // Chat Logs
        CreateMap<ChatLogs, ChatLogResponseDto>().ReverseMap();
        CreateMap<ChatLogRequestDto, ChatLogs>();

        // Wishlists
        CreateMap<Wishlists, WishlistResponseDto>().ReverseMap();
        CreateMap<WishlistRequestDto, Wishlists>();
    }
}
