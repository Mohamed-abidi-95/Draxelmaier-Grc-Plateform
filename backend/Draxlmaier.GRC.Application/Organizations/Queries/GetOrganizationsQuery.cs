using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Organizations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Organizations.Queries;

public class GetOrganizationsQuery : IRequest<List<OrganizationDto>>
{
}

public class GetOrganizationsQueryHandler : IRequestHandler<GetOrganizationsQuery, List<OrganizationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrganizationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrganizationDto>> Handle(GetOrganizationsQuery request, CancellationToken cancellationToken)
    {
        var organizations = await _context.Organizations
            .OrderBy(o => o.Name)
            .ToListAsync(cancellationToken);

        return organizations.Select(o => new OrganizationDto
        {
            Id = o.Id,
            Name = o.Name,
            Description = o.Description ?? string.Empty
        }).ToList();
    }
}
