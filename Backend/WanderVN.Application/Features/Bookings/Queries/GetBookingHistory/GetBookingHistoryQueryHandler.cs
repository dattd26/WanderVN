using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Response;

namespace WanderVN.Application.Features.Bookings.Queries.GetBookingHistory;

public class GetBookingHistoryQueryHandler : IRequestHandler<GetBookingHistoryQuery, List<BookingHistoryDto>>
{
    private readonly IBookingRepository _bookingRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetBookingHistoryQueryHandler(IBookingRepository bookingRepository, ICurrentUserService currentUserService)
    {
        _bookingRepository = bookingRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<BookingHistoryDto>> Handle(GetBookingHistoryQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("Không thể xác định người dùng.");

        return await _bookingRepository.GetBookingHistoryAsync(userId, cancellationToken);
    }
}
