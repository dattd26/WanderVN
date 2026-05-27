using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Models;

namespace WanderVN.Application.Features.Hotels.Queries.GetHotelsReview;

public class GetHotelsReviewQueryHandler : IRequestHandler<GetHotelsReviewQuery, PagedResult<HotelsReviewDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetHotelsReviewQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<HotelsReviewDto>> Handle(GetHotelsReviewQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = Math.Max(request.PageNumber, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _dbContext.Hotels
            .Include(h => h.Location)
            .Include(h => h.Owner)
            .Include(h => h.PropertyType)
            .Include(h => h.HotelImages)
            .Include(h => h.RoomTypes)
            .AsNoTracking();

        if (request.Status.HasValue)
        {
            query = query.Where(h => h.Status == request.Status.Value);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var hotels = await query
            .OrderByDescending(h => h.SubmittedAt ?? h.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = hotels.Select(h =>
        {
            var thumbnail = h.HotelImages.FirstOrDefault(img => img.IsPrimary == true)?.ImageUrl 
                            ?? h.HotelImages.FirstOrDefault()?.ImageUrl 
                            ?? string.Empty;

            var gallery = h.HotelImages.Select(img => img.ImageUrl ?? string.Empty).ToList();

            var statusStr = h.Status switch
            {
                0 => "pending",
                1 => "approved",
                2 => "rejected",
                _ => "pending"
            };

            var locationStr = h.Location != null 
                ? $"{h.Address}, {h.Location.Name}"
                : h.Address ?? string.Empty;

            var roomTypeDtos = h.RoomTypes.Select(rt => new ReviewRoomTypeDto
            {
                Name = rt.Name,
                Summary = rt.Description ?? $"Sức chứa: {rt.Capacity} khách - {rt.TotalRooms} phòng",
                Icon = rt.Name.ToLower().Contains("suite") ? "apartment" : "bed",
                Price = $"{rt.BasePrice / 1000:0}k"
            }).ToList();

            return new HotelsReviewDto
            {
                Id = h.Id,
                Name = h.Name,
                Location = locationStr,
                Category = h.PropertyType?.Name ?? "Khách sạn",
                PartnerName = h.Owner != null ? h.Owner.FullName ?? h.Owner.Email : "Chủ sở hữu",
                PartnerCode = h.Owner != null ? $"Partner #{h.Owner.Id}" : "Partner #N/A",
                SubmittedAt = h.SubmittedAt,
                SubmittedTime = h.SubmittedAt?.ToString("HH:mm - dd/MM/yyyy") ?? string.Empty,
                Status = statusStr,
                Thumbnail = thumbnail,
                Gallery = gallery,
                Description = h.Description ?? string.Empty,
                Area = "N/A",
                Scale = $"{h.RoomTypes.Sum(rt => rt.TotalRooms)} Phòng",
                RoomTypes = roomTypeDtos,
                RejectReason = h.RejectReason
            };
        }).ToList();

        return new PagedResult<HotelsReviewDto>(dtos, totalItems, pageNumber, pageSize);
    }
}
