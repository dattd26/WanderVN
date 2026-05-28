using MediatR;

namespace WanderVN.Application.Features.Admin.Hotels.Commands.RejectHotel;

public record RejectHotelCommand(int HotelId, string Reason) : IRequest<RejectHotelResult>;

public record RejectHotelResult(bool Success, string Message);
