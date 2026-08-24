using System;
using System.Collections.Generic;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class Risk
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid? AssetId { get; set; }
    public Guid? BusinessUnitId { get; set; }
    public Guid OwnerId { get; set; } // Reference to ApplicationUser (RiskOwner)
    public RiskStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public Asset? Asset { get; set; }
    public BusinessUnit? BusinessUnit { get; set; }
    public ICollection<RiskAssessment> Assessments { get; set; } = new List<RiskAssessment>();
    public ICollection<RiskTreatment> Treatments { get; set; } = new List<RiskTreatment>();
    public ICollection<RiskControl> RiskControls { get; set; } = new List<RiskControl>();
}
