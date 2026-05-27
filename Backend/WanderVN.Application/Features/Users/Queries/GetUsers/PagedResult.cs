namespace WanderVN.Application.Features.Users.Queries.GetUsers;

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; }
    public int TotalItems { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalPages { get; }

    public PagedResult(IEnumerable<T> items, int totalItems, int pageNumber, int pageSize)
    {
        Items = items;
        TotalItems = totalItems;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)pageSize);
    }
}
