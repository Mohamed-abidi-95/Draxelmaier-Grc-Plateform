using System;
using System.Collections.Generic;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class Finding
{
    public Guid Id { get; set; }
    public Guid AuditId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public FindingSeverity Severity { get; set; } = FindingSeverity.Medium;
    public FindingStatus Status { get; set; } = FindingStatus.Open;
    
    public Guid? AssigneeId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    
    // Navigation properties
    public Audit? Audit { get; set; }
    public ICollection<CorrectiveAction> CorrectiveActions { get; set; } = new List<CorrectiveAction>();
}
