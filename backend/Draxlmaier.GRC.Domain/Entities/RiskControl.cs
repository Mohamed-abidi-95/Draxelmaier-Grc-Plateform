using System;

namespace Draxlmaier.GRC.Domain.Entities;

public class RiskControl
{
    public Guid RiskId { get; set; }
    public Guid ControlId { get; set; }

    // Navigation properties
    public Risk Risk { get; set; } = null!;
    public Control Control { get; set; } = null!;
}
