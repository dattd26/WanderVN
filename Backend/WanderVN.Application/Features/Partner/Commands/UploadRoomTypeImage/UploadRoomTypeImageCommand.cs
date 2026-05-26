using MediatR;
using System.IO;

namespace WanderVN.Application.Features.Partner.Commands.UploadRoomTypeImage;

public class UploadRoomTypeImageCommand : IRequest<UploadRoomTypeImageResponse>
{
    public int HotelId { get; set; }
    public int RoomTypeId { get; set; }
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
}

public class UploadRoomTypeImageResponse
{
    public int ImageId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
}
