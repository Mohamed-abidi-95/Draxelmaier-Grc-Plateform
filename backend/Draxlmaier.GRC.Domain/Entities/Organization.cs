using System;

namespace Draxlmaier.GRC.Domain.Entities
{
    public class Organization
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public System.Collections.Generic.ICollection<BusinessUnit> BusinessUnits { get; set; } = new System.Collections.Generic.List<BusinessUnit>();
    }
}
