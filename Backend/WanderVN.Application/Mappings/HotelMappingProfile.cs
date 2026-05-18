using AutoMapper;
using WanderVN.Application.DTOs.Hotels;
using WanderVN.Application.DTOs.RoomTypes;
using WanderVN.Application.DTOs.Rooms;
using WanderVN.Application.DTOs.Amenities;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Mappings;

public class HotelMappingProfile : Profile
{
    public HotelMappingProfile()
    {
        // Hotels
        CreateMap<Hotels, HotelResponseDto>().ReverseMap();
        CreateMap<HotelRequestDto, Hotels>();

        // Hotel Images
        CreateMap<HotelImages, HotelImageResponseDto>().ReverseMap();
        CreateMap<HotelImageRequestDto, HotelImages>();

        // Room Types
        CreateMap<RoomTypes, RoomTypeResponseDto>().ReverseMap();
        CreateMap<RoomTypeRequestDto, RoomTypes>();

        // Room Type Images
        CreateMap<RoomTypeImages, RoomTypeImageResponseDto>().ReverseMap();
        CreateMap<RoomTypeImageRequestDto, RoomTypeImages>();

        // Rooms
        CreateMap<Rooms, RoomResponseDto>().ReverseMap();
        CreateMap<RoomRequestDto, Rooms>();

        // Amenities
        CreateMap<Amenities, AmenityResponseDto>().ReverseMap();
        CreateMap<AmenityRequestDto, Amenities>();
    }
}
