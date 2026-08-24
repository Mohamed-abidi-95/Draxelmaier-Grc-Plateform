using System;

namespace Draxlmaier.GRC.Application.Compliance.DTOs
{
    public class ControlMappingDto
    {
        public Guid Id { get; set; }
        public Guid RequirementId { get; set; }
        public Guid? PolicyId { get; set; }
        public Guid? ControlId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Origin { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
