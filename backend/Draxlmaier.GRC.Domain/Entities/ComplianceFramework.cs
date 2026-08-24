using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Domain.Entities
{
    public class ComplianceFramework
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty; // e.g., "ISO 27001"
        public string Version { get; set; } = string.Empty; // e.g., "2022"
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // The uploaded file (PDF, Excel, JSON, etc)
        public Guid? DocumentId { get; set; }
        public Document? Document { get; set; }

        // Navigation property
        public ICollection<ComplianceRequirement> Requirements { get; set; } = new List<ComplianceRequirement>();
    }
}
