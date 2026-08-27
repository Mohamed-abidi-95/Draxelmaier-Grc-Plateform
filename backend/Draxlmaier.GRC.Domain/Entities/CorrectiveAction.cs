using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class CorrectiveAction
{
    public Guid Id { get; set; }
    public Guid FindingId { get; set; }
    public string Description { get; set; } = string.Empty;
    
    public CorrectiveActionStatus Status { get; set; } = CorrectiveActionStatus.Pending;
    
    public Guid? OwnerId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public Finding? Finding { get; set; }
}
