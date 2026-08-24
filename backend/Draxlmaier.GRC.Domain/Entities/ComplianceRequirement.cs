using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Domain.Entities
{
    public class ComplianceRequirement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FrameworkId { get; set; }
        public string Identifier { get; set; } = string.Empty; // e.g., "5.1", "A.5.1.1"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Navigation properties
        public ComplianceFramework? Framework { get; set; }
        public ICollection<ControlMapping> ControlMappings { get; set; } = new List<ControlMapping>();
    }
}
