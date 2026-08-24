using System;

namespace Draxlmaier.GRC.Domain.Entities;

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Logicial isolation (tenant/organization)
    public Guid OrganizationId { get; set; }
    
    // Abstract storage key, e.g., "tenant/{orgId}/documents/{docId}/{filename}"
    public string StorageKey { get; set; } = string.Empty;
    
    public string OriginalFilename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    
    // Useful for integrity verification
    public string HashSha256 { get; set; } = string.Empty;
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public string UploadedBy { get; set; } = string.Empty; // User ID
}
