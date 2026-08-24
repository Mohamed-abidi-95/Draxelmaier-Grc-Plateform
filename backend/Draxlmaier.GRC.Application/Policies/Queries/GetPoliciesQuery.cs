using System;
using System.Collections.Generic;
using Draxlmaier.GRC.Application.Policies.DTOs;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Queries;

public class GetPoliciesQuery : IRequest<List<PolicyDto>>
{
    public Guid OrganizationId { get; set; }
}
