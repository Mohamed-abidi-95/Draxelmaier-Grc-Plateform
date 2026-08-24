using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.BusinessUnits;

public class GetBusinessUnitsQuery : IRequest<List<BusinessUnitDto>>
{
    public Guid OrganizationId { get; set; }
}

public class GetBusinessUnitsQueryHandler : IRequestHandler<GetBusinessUnitsQuery, List<BusinessUnitDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBusinessUnitsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BusinessUnitDto>> Handle(GetBusinessUnitsQuery request, CancellationToken cancellationToken)
    {
        var units = await _context.BusinessUnits
            .Where(b => b.OrganizationId == request.OrganizationId)
            .Select(b => new BusinessUnitDto
            {
                Id = b.Id,
                Name = b.Name,
                OrganizationId = b.OrganizationId,
                ParentId = b.ParentId
            })
            .ToListAsync(cancellationToken);

        // Build the tree in memory
        var lookup = units.ToLookup(b => b.ParentId);
        var roots = lookup[null].ToList();

        void AddChildren(BusinessUnitDto node)
        {
            node.Children = lookup[node.Id].ToList();
            foreach (var child in node.Children)
            {
                AddChildren(child);
            }
        }

        foreach (var root in roots)
        {
            AddChildren(root);
        }

        return roots;
    }
}
