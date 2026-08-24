using System;

namespace Draxlmaier.GRC.Application.Controls.DTOs
{
    public class ControlDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
