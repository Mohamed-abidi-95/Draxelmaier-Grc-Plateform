using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Policies.Commands;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Draxlmaier.GRC.Api.Workers;

public class PolicyReminderWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PolicyReminderWorker> _logger;

    public PolicyReminderWorker(IServiceProvider serviceProvider, ILogger<PolicyReminderWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Policy Reminder Worker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Policy Reminder Worker running at: {time}", DateTimeOffset.Now);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                    var command = new SendPolicyRemindersCommand { DaysBeforeExpiration = 30 };
                    var sentCount = await mediator.Send(command, stoppingToken);
                    
                    _logger.LogInformation("Policy Reminder Worker sent {Count} emails.", sentCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in Policy Reminder Worker.");
            }

            // In production, this would run once a day (e.g., at 2 AM).
            // For MVP testing, we run it every 1 minute so the user can see it in action quickly.
            // Adjust this to TimeSpan.FromDays(1) later.
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
