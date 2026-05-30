using MediatR;
using WanderVN.Application.Features.Settings.DTOs;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Settings.Queries.GetSetting;

public class GetSettingQuery : IRequest<SettingResponseDto?>
{
    public string Key { get; set; } = null!;
}

public class GetSettingQueryHandler : IRequestHandler<GetSettingQuery, SettingResponseDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetSettingQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<SettingResponseDto?> Handle(GetSettingQuery request, CancellationToken cancellationToken)
    {
        var setting = await _unitOfWork.SystemSettings.FindFirstOrDefaultAsync(s => s.Key == request.Key, cancellationToken: cancellationToken);
        if (setting == null) return null;

        return new SettingResponseDto
        {
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description
        };
    }
}
