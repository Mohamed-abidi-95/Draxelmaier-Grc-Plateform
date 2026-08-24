using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class Audit
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid AuditorId { get; set; }
    public Guid? TargetFrameworkId { get; set; }
    
    public AuditStatus Status { get; set; } = AuditStatus.Planned;
    public AuditResult Result { get; set; } = AuditResult.NotAssessed;
    
    public DateTime? PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    
    // Navigation properties
    public Organization? Organization { get; set; }
    public ComplianceFramework? TargetFramework { get; set; }
}
