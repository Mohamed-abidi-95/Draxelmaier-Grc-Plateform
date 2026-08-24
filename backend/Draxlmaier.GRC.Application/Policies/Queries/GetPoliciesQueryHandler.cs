using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Policies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Policies.Queries;

public class GetPoliciesQueryHandler : IRequestHandler<GetPoliciesQuery, List<PolicyDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPoliciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PolicyDto>> Handle(GetPoliciesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Policies
            .Where(p => p.OrganizationId == request.OrganizationId)
            .Select(p => new PolicyDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                OwnerId = p.OwnerId,
                OrganizationId = p.OrganizationId,
                ExpiryDate = p.ExpiryDate,
                Status = p.Status,
                DocumentId = p.DocumentId,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
