using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;

namespace WanderVN.Application.Features.Hotels.Commands.ApproveHotel;

public class ApproveHotelCommandHandler : IRequestHandler<ApproveHotelCommand, bool>
{
    private readonly IApplicationDbContext _dbContext;

    public ApproveHotelCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(ApproveHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await _dbContext.Hotels
            .FirstOrDefaultAsync(h => h.Id == request.HotelId, cancellationToken);

        if (hotel == null)
        {
            return false;
        }

        hotel.Status = 1; // Approved
        hotel.ApprovedAt = DateTimeOffset.UtcNow;
        hotel.RejectReason = null;
        hotel.IsActive = true; // Auto-activate hotel on approval

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
