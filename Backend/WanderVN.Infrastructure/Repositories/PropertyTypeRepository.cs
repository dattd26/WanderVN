using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using Microsoft.EntityFrameworkCore;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Features.PropertyTypes.Queries.GetPropertyTypes;
using WanderVN.Infrastructure.Data;

namespace WanderVN.Infrastructure.Repositories;

/// <summary>
/// Triển khai thực tế của IPropertyTypeRepository bằng cách sử dụng Dapper để tối ưu hiệu năng.
/// </summary>
public class PropertyTypeRepository : IPropertyTypeRepository
{
    private readonly WanderVNDbContext _dbContext;

    public PropertyTypeRepository(WanderVNDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<GetPropertyTypesDto>> GetPropertyTypesAsync(CancellationToken cancellationToken)
    {
        var connection = _dbContext.Database.GetDbConnection();

        if (connection.State == ConnectionState.Closed)
        {
            await connection.OpenAsync(cancellationToken);
        }

        const string sql = "SELECT Id, Name, Code FROM PropertyTypes";

        var result = await connection.QueryAsync<GetPropertyTypesDto>(
            new CommandDefinition(sql, cancellationToken: cancellationToken)
        );

        return result.ToList();
    }
}
