using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Application.Risks.DTOs;

public class RiskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public int ControlsCount { get; set; }
    public Guid? AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<RiskControlDto> LinkedControls { get; set; } = new();
    public List<RiskAssessmentDto> Assessments { get; set; } = new();
}

public class RiskAssessmentDto
{
    public Guid Id { get; set; }
    public Guid RiskId { get; set; }
    public string RiskTitle { get; set; } = string.Empty;
    public int Probability { get; set; }
    public int Impact { get; set; }
    public int Score { get; set; }
    public Guid AssessorId { get; set; }
    public DateTime AssessedAt { get; set; }
}

public class RiskTreatmentDto
{
    public Guid Id { get; set; }
    public Guid RiskId { get; set; }
    public string RiskTitle { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
}

public class RiskControlDto
{
    public Guid ControlId { get; set; }
    public string ControlName { get; set; } = string.Empty;
}
