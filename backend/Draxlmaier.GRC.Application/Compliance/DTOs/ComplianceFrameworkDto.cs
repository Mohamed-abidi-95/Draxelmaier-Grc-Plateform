using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Application.Compliance.DTOs
{
    public class ComplianceFrameworkDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
