using System;

namespace Draxlmaier.GRC.Application.Policies.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }
    public string OriginalFilename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string HashSha256 { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public string UploadedBy { get; set; } = string.Empty;
}
