using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Hotels.Commands.RejectHotel;

public class RejectHotelCommandHandler : IRequestHandler<RejectHotelCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public RejectHotelCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(RejectHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await _dbContext.Hotels
            .FirstOrDefaultAsync(h => h.Id == request.HotelId, cancellationToken);

        if (hotel == null)
        {
            return false;
        }

        hotel.Status = 2; // Rejected
        hotel.RejectReason = request.RejectReason;
        hotel.ApprovedAt = null; // Clear approval timestamp

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
