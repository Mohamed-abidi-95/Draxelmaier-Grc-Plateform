using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public class SendPolicyRemindersCommandHandler : IRequestHandler<SendPolicyRemindersCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<SendPolicyRemindersCommandHandler> _logger;

    public SendPolicyRemindersCommandHandler(
        IApplicationDbContext context, 
        IEmailService emailService,
        ILogger<SendPolicyRemindersCommandHandler> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<int> Handle(SendPolicyRemindersCommand request, CancellationToken cancellationToken)
    {
        var targetDate = DateTime.UtcNow.Date.AddDays(request.DaysBeforeExpiration);
        var nextDay = targetDate.AddDays(1);

        // Fetch policies expiring on the exact target date
        var policiesExpiring = await _context.Policies
            .Where(p => p.ExpiryDate >= targetDate && p.ExpiryDate < nextDay)
            // Note: Since we don't have the User entity fully populated with Emails in DB yet 
            // (Identity handles it), in a real scenario we'd join with AspNetUsers to get the Email.
            // For MVP, we simulate sending to a dummy address if the owner email isn't available.
            .ToListAsync(cancellationToken);

        int emailsSent = 0;

        foreach (var policy in policiesExpiring)
        {
            // For this MVP, we assume OwnerId is the email or we use a fallback
            var ownerEmail = policy.OwnerId.Contains("@") ? policy.OwnerId : "owner@draxlmaier.local";
            
            var subject = $"Action Required: Policy '{policy.Title}' is expiring soon";
            var body = $@"
                <h3>Policy Expiration Reminder</h3>
                <p>Hello,</p>
                <p>This is an automated reminder that the policy <strong>{policy.Title}</strong> is set to expire on {policy.ExpiryDate:yyyy-MM-dd}.</p>
                <p>Please review and update the policy accordingly.</p>
                <br>
                <p>Thank you,<br>DRÄXLMAIER GRC Platform</p>
            ";

            try
            {
                await _emailService.SendEmailAsync(ownerEmail, subject, body, cancellationToken);
                emailsSent++;
                _logger.LogInformation("Reminder sent for policy {PolicyId} to {Email}", policy.Id, ownerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send reminder for policy {PolicyId}", policy.Id);
            }
        }

        return emailsSent;
    }
}
