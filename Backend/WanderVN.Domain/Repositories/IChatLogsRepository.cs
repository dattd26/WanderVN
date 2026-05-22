using WanderVN.Domain.Entities;

namespace WanderVN.Domain.Repositories;

public interface IChatLogsRepository : IGenericRepository<ChatLogs>
{
    Task SaveChatLog(int? userId, string message, bool isFromBot, CancellationToken cancellationToken = default);
    Task<IEnumerable<ChatLogs>> GetUserChatHistory(int userId, int? limit = 50, CancellationToken cancellationToken = default);
}
