using AutoMapper;
using WanderVN.Application.DTOs.Locations;
using WanderVN.Application.DTOs.Tours;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Mappings;

public class TourMappingProfile : Profile
{
    public TourMappingProfile()
    {
        // Locations
        CreateMap<Locations, LocationResponseDto>().ReverseMap();
        CreateMap<LocationRequestDto, Locations>();

        // Tours
        CreateMap<Tours, TourResponseDto>().ReverseMap();
        CreateMap<TourRequestDto, Tours>();

        // Tour Images
        CreateMap<TourImages, TourImageResponseDto>().ReverseMap();
        CreateMap<TourImageRequestDto, TourImages>();
    }
}
