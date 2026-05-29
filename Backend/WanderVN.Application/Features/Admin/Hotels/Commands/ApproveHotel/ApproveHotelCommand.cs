using MediatR;

namespace WanderVN.Application.Features.Admin.Hotels.Commands.ApproveHotel;

public record ApproveHotelCommand(int HotelId) : IRequest<ApproveHotelResult>;

public record ApproveHotelResult(bool Success, string Message);
