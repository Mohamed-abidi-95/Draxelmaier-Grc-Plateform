using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Domain.Entities;

public class BusinessUnit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid? ParentId { get; set; }
    
    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public BusinessUnit? Parent { get; set; }
    public ICollection<BusinessUnit> Children { get; set; } = new List<BusinessUnit>();
    
    public ICollection<Policy> Policies { get; set; } = new List<Policy>();
    public ICollection<Risk> Risks { get; set; } = new List<Risk>();
    public ICollection<Control> Controls { get; set; } = new List<Control>();
}
