using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.Common.Models;

namespace WanderVN.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
    {
        try
        {
            // Thiết lập máy chủ SMTP ẩn hoặc SMTP mô phỏng
            using var smtpClient = new SmtpClient(_emailSettings.SmtpServer)
            {
                Port = _emailSettings.Port,
                Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.Password),
                EnableSsl = _emailSettings.EnableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                Body = isHtml ? GetPremiumTemplate(body) : body,
                IsBodyHtml = isHtml
            };

            mailMessage.To.Add(toEmail);

            _logger.LogInformation("Đang gửi email xác nhận tự động tới {Email}...", toEmail);
            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation("Email đã được phát đi thành công tới {Email}.", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra trong quá trình gửi email tự động tới {Email}.", toEmail);
            // Không throw exception để tránh làm gián đoạn luồng đăng ký chính
        }
    }

    private string GetPremiumTemplate(string customMessage)
    {
        return $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>Chào Mừng Bạn Đến Với WanderVN</title>
            <style>
                body {{
                    font-family: 'Georgia', serif;
                    background-color: #fdf9f4;
                    color: #1c1c19;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 10px 30px rgba(28, 28, 25, 0.03);
                    position: relative;
                }}
                .gold-line {{
                    height: 4px;
                    background: linear-gradient(to right, #fed65b, #735c00, #fed65b);
                }}
                .header {{
                    text-align: center;
                    padding: 40px 20px 20px 20px;
                }}
                .brand-title {{
                    font-size: 28px;
                    font-weight: normal;
                    letter-spacing: -0.03em;
                    color: #735c00;
                    margin: 0;
                }}
                .divider {{
                    width: 40px;
                    height: 1px;
                    background-color: #735c00;
                    opacity: 0.3;
                    margin: 15px auto;
                }}
                .welcome-title {{
                    font-size: 20px;
                    color: #1c1c19;
                    font-weight: normal;
                    margin: 10px 0;
                }}
                .content {{
                    padding: 20px 40px 40px 40px;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                    line-height: 1.8;
                    color: #4a4a46;
                }}
                .button-container {{
                    text-align: center;
                    margin: 35px 0;
                }}
                .btn-premium {{
                    display: inline-block;
                    background-color: #735c00;
                    color: #ffffff !important;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 12px;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    padding: 16px 36px;
                    border: 1px solid #735c00;
                    transition: all 0.3s ease;
                }}
                .footer {{
                    background-color: #fcf8f3;
                    border-t: 1px solid #e5e7eb;
                    padding: 30px;
                    text-align: center;
                    font-size: 11px;
                    color: #9e9e9a;
                    font-family: 'Inter', system-ui, sans-serif;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }}
                .quote {{
                    font-style: italic;
                    margin-top: 15px;
                    color: #735c00;
                    opacity: 0.7;
                    text-transform: none;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='gold-line'></div>
                <div class='header'>
                    <h1 class='brand-title'>WanderVN</h1>
                    <div class='divider'></div>
                    <h2 class='welcome-title'>Khởi đầu hành trình di sản</h2>
                </div>
                <div class='content'>
                    {customMessage}
                    <div class='button-container'>
                        <a href='http://localhost:5173/login' class='btn-premium'>Đăng Nhập Khám Phá</a>
                    </div>
                    <p style='margin-top: 30px;'>Chúc bạn có những chuyến đi tinh tế và đáng nhớ nhất.</p>
                    <p style='margin-bottom: 0;'>Trân trọng,<br><strong style='color:#735c00;'>Đội ngũ WanderVN</strong></p>
                </div>
                <div class='footer'>
                    © {DateTime.UtcNow.Year} WanderVN. Crafted for the Discerning Traveler.
                    <div class='quote'>""Luxury is not a place, but a moment captured in time.""</div>
                </div>
            </div>
        </body>
        </html>";
    }
}
