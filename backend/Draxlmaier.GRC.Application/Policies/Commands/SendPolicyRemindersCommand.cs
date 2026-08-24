using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public class SendPolicyRemindersCommand : IRequest<int>
{
    // The number of days before expiration to send the reminder.
    public int DaysBeforeExpiration { get; set; } = 30;
}
