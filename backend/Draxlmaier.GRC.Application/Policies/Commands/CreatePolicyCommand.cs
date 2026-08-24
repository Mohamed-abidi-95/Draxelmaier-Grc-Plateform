using System;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public class CreatePolicyCommand : IRequest<Guid>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public Guid DocumentId { get; set; }
}
