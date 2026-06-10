using System.Data;
using Dapper;
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
        var connection = _context.Database.GetDbConnection();
        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        // Sử dụng Dapper để truy vấn chat logs trực tiếp từ SQL Server
        const string sql = @"
            SELECT TOP (@Limit) Id, UserId, MessageText, IsFromBot, SentAt
            FROM ChatLogs
            WHERE UserId = @UserId
            ORDER BY SentAt DESC";

        var result = await connection.QueryAsync<ChatLogs>(
            new CommandDefinition(sql, new { UserId = userId, Limit = limit ?? 50 }, cancellationToken: cancellationToken)
        );

        return result;
    }
}
