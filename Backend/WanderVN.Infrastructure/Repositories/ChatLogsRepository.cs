using Microsoft.EntityFrameworkCore;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

public class ChatLogsRepository : GenericRepository<ChatLogs>, IChatLogsRepository
{
    public ChatLogsRepository(WanderVNDbContext context) : base(context)
    {
    }

    public async Task SaveChatLog(int? userId, string message, bool isFromBot, CancellationToken cancellationToken = default)
    {
        var chatLog = new ChatLogs
        {
            UserId = userId,
            MessageText = message,
            IsFromBot = isFromBot,
            SentAt = DateTimeOffset.UtcNow
        };

        await AddAsync(chatLog, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<ChatLogs>> GetUserChatHistory(int userId, int? limit = 50, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.SentAt)
            .Take(limit ?? 50);

        return await query.ToListAsync(cancellationToken);
    }
}
