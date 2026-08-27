using System;

namespace Draxlmaier.GRC.Application.Audits.DTOs;

public class CorrectiveActionDto
{
    public Guid Id { get; set; }
    public Guid FindingId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
}
