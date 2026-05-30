using MediatR;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Settings.Commands.UpdateSetting;

public class UpdateSettingCommand : IRequest<bool>
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}

public class UpdateSettingCommandHandler : IRequestHandler<UpdateSettingCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSettingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateSettingCommand request, CancellationToken cancellationToken)
    {
        var setting = await _unitOfWork.SystemSettings.FindFirstOrDefaultAsync(s => s.Key == request.Key, cancellationToken: cancellationToken);
        if (setting == null)
        {
            setting = new SystemSettings { Key = request.Key, Value = request.Value };
            await _unitOfWork.SystemSettings.AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.Value = request.Value;
            _unitOfWork.SystemSettings.Update(setting);
        }

        return await _unitOfWork.SaveChangesAsync(cancellationToken) > 0;
    }
}
