using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Application.Compliance.DTOs;

public class SoAReportItemDto
{
    public Guid RequirementId { get; set; }
    public string Identifier { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // SoA Specific Fields
    public bool IsApplicable { get; set; } = true;
    public string Justification { get; set; } = string.Empty;
    public string Status { get; set; } = "NotAssessed";

    // Linked Items
    public List<SoALinkedItemDto> LinkedPolicies { get; set; } = new List<SoALinkedItemDto>();
    public List<SoALinkedItemDto> LinkedControls { get; set; } = new List<SoALinkedItemDto>();
}

public class SoALinkedItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
