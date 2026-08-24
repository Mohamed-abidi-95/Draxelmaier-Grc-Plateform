using System;

namespace Draxlmaier.GRC.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Create, Update, Delete
    public DateTime Timestamp { get; set; }
    public string Changes { get; set; } = string.Empty; // JSON representation of changes
    public Guid? UserId { get; set; } // Nullable because system actions might not have a user
}
