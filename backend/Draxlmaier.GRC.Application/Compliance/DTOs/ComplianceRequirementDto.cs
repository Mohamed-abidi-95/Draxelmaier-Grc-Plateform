using System;

namespace Draxlmaier.GRC.Application.Compliance.DTOs
{
    public class ComplianceRequirementDto
    {
        public Guid Id { get; set; }
        public Guid FrameworkId { get; set; }
        public string Identifier { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Aggregated status
    }
}
