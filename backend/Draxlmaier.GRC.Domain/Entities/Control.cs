using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Domain.Entities
{
    public class Control
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrganizationId { get; set; }
        public Guid? BusinessUnitId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Organization? Organization { get; set; }
        public BusinessUnit? BusinessUnit { get; set; }
        public ICollection<ControlMapping> ControlMappings { get; set; } = new List<ControlMapping>();
        public ICollection<RiskControl> RiskControls { get; set; } = new List<RiskControl>();
    }
}
