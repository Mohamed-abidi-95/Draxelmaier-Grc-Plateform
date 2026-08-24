using System;

namespace Draxlmaier.GRC.Domain.Entities;

public class RiskAssessment
{
    public Guid Id { get; set; }
    public Guid RiskId { get; set; }
    public int Probability { get; set; } // 1 to 5
    public int Impact { get; set; } // 1 to 5
    public int Score { get; set; } // Probability * Impact
    public Guid AssessorId { get; set; }
    public DateTime AssessedAt { get; set; }

    // Navigation property
    public Risk Risk { get; set; } = null!;
}
