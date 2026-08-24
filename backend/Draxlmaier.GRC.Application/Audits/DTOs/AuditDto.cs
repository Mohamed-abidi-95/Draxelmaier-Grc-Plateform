using System;

namespace Draxlmaier.GRC.Application.Audits.DTOs;

public class AuditDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public DateTime? PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string AuditorName { get; set; } = string.Empty;
    public string TargetFrameworkName { get; set; } = string.Empty;
}
