using System;
using System.Collections.Generic;

namespace Draxlmaier.GRC.Application.BusinessUnits;

public class BusinessUnitDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid? ParentId { get; set; }
    public List<BusinessUnitDto> Children { get; set; } = new List<BusinessUnitDto>();
}
