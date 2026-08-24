using System;

namespace Draxlmaier.GRC.Application.Compliance.DTOs
{
    public class EvidenceDto
    {
        public Guid Id { get; set; }
        public Guid ControlMappingId { get; set; }
        public Guid DocumentId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string OriginalFilename { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
    }
}
