using System.Threading.Tasks;

namespace WanderVN.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
}
