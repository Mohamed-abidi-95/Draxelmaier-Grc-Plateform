using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Application.Policies.DTOs;

public class PolicyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public PolicyStatus Status { get; set; }
    public Guid DocumentId { get; set; }
    public DateTime CreatedAt { get; set; }
}
