using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Application.Findings.DTOs;

public class FindingDto
{
    public Guid Id { get; set; }
    public Guid AuditId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public FindingSeverity Severity { get; set; }
    public FindingStatus Status { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    
    // Additional fields for display
    public string AuditTitle { get; set; } = string.Empty;
    public string AssigneeName { get; set; } = string.Empty;
}
