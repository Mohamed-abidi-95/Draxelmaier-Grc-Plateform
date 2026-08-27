using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities
{
    public class ControlMapping
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RequirementId { get; set; }
        
        // A mapping can be linked to either a Policy OR a Control (or both)
        public Guid? PolicyId { get; set; }
        public Guid? ControlId { get; set; }

        public ComplianceStatus Status { get; set; } = ComplianceStatus.NotAssessed;
        public MappingOrigin Origin { get; set; } = MappingOrigin.Manual;
        public bool IsApplicable { get; set; } = true;
        public string Justification { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ComplianceRequirement? Requirement { get; set; }
        public Policy? Policy { get; set; }
        public Control? Control { get; set; }
        public System.Collections.Generic.ICollection<Evidence> Evidences { get; set; } = new System.Collections.Generic.List<Evidence>();
    }
}
