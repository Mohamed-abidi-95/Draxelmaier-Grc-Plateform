using System;

namespace Draxlmaier.GRC.Domain.Entities;

public class PolicyReview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PolicyId { get; set; }
    
    public string ReviewerId { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    
    public string Comments { get; set; } = string.Empty;
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Policy? Policy { get; set; }
}
