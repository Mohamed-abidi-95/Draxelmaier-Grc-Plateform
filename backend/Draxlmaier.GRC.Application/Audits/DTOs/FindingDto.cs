using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Application.Audits.DTOs;

public class FindingDto
{
    public Guid Id { get; set; }
    public Guid AuditId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
