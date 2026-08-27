using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class AuditItem
{
    public Guid Id { get; set; }
    public Guid AuditId { get; set; }
    public string Requirement { get; set; } = string.Empty;
    public AuditItemStatus Status { get; set; } = AuditItemStatus.Pending;
    public string Comments { get; set; } = string.Empty;
    public Guid? EvidenceId { get; set; }
    
    // Navigation properties
    public Audit? Audit { get; set; }
    public Document? Evidence { get; set; }
}
