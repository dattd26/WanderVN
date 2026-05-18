using AutoMapper;
using WanderVN.Application.DTOs.Flights;
using WanderVN.Application.DTOs.Airlines;
using WanderVN.Application.DTOs.Airports;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Mappings;

public class FlightMappingProfile : Profile
{
    public FlightMappingProfile()
    {
        // Airlines
        CreateMap<Airlines, AirlineResponseDto>().ReverseMap();
        CreateMap<AirlineRequestDto, Airlines>();

        // Airports
        CreateMap<Airports, AirportResponseDto>().ReverseMap();
        CreateMap<AirportRequestDto, Airports>();

        // Flights
        CreateMap<Flights, FlightResponseDto>().ReverseMap();
        CreateMap<FlightRequestDto, Flights>();
    }
}
