using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Application.Audits.DTOs;

public class AuditItemDto
{
    public Guid Id { get; set; }
    public Guid AuditId { get; set; }
    public string Requirement { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
    public Guid? EvidenceId { get; set; }
}
