using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Draxlmaier.GRC.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var message = new MimeMessage();
        
        var fromEmail = _configuration["Smtp:FromEmail"] ?? "noreply@draxlmaier.local";
        var fromName = _configuration["Smtp:FromName"] ?? "DRÄXLMAIER GRC";
        
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var builder = new BodyBuilder
        {
            HtmlBody = body
        };
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            var host = _configuration["Smtp:Host"] ?? "localhost";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 1025;
            
            // For development with Mailpit, SSL is typically disabled
            var useSsl = bool.TryParse(_configuration["Smtp:UseSsl"], out var s) && s;

            await client.ConnectAsync(host, port, useSsl, cancellationToken);

            var username = _configuration["Smtp:Username"];
            var password = _configuration["Smtp:Password"];

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                await client.AuthenticateAsync(username, password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
            
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "An error occurred while sending email to {To}", to);
            throw;
        }
    }
}
