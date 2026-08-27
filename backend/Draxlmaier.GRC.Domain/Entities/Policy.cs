using System;
using Draxlmaier.GRC.Domain.Enums;

namespace Draxlmaier.GRC.Domain.Entities;

public class Policy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Who owns this policy (User ID)
    public string OwnerId { get; set; } = string.Empty;
    
    // Organization / Tenant boundary
    public Guid OrganizationId { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    public PolicyStatus Status { get; set; } = PolicyStatus.Draft;
    
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    
    public Guid? BusinessUnitId { get; set; }
    public BusinessUnit? BusinessUnit { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public System.Collections.Generic.ICollection<ControlMapping> ControlMappings { get; set; } = new System.Collections.Generic.List<ControlMapping>();
    public System.Collections.Generic.ICollection<PolicyReview> PolicyReviews { get; set; } = new System.Collections.Generic.List<PolicyReview>();
}
