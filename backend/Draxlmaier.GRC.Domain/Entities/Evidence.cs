using System;

namespace Draxlmaier.GRC.Domain.Entities
{
    public class Evidence
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ControlMappingId { get; set; }
        public Guid DocumentId { get; set; }
        
        public string Description { get; set; } = string.Empty;
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public string UploadedBy { get; set; } = string.Empty; // User ID

        // Navigation properties
        public ControlMapping? ControlMapping { get; set; }
        public Document? Document { get; set; }
    }
}
