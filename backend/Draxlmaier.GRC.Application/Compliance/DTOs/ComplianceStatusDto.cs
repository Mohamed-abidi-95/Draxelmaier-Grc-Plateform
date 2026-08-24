using System;

namespace Draxlmaier.GRC.Application.Compliance.DTOs
{
    public class ComplianceStatusDto
    {
        public Guid FrameworkId { get; set; }
        public string FrameworkName { get; set; } = string.Empty;
        public int TotalRequirements { get; set; }
        public int CompliantRequirements { get; set; }
        public int NonCompliantRequirements { get; set; }
        public int NotAssessedRequirements { get; set; }
        public double ComplianceScorePercentage { get; set; }
    }
}
