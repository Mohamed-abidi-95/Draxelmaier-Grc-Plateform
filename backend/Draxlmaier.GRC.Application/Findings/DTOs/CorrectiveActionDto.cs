using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Application.Findings.DTOs;

public class CorrectiveActionDto
{
    public Guid Id { get; set; }
    public Guid FindingId { get; set; }
    public string Description { get; set; } = string.Empty;
    public CorrectiveActionStatus Status { get; set; }
    public Guid? OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // For display
    public string OwnerName { get; set; } = string.Empty;
}
