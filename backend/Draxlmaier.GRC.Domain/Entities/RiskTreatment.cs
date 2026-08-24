using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class RiskTreatment
{
    public Guid Id { get; set; }
    public Guid RiskId { get; set; }
    public RiskTreatmentType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    
    // Navigation property
    public Risk Risk { get; set; } = null!;
}
