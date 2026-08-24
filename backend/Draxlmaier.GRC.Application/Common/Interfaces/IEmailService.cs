using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Common.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Sends an email asynchronously.
    /// </summary>
    /// <param name="to">Recipient email address.</param>
    /// <param name="subject">Email subject.</param>
    /// <param name="body">Email body (HTML).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
}
