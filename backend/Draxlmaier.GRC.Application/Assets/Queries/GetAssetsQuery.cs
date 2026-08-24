using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Assets.DTOs;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Assets.Queries;

public class GetAssetsQuery : IRequest<List<AssetDto>>
{
    public Guid OrganizationId { get; set; }
}

public class GetAssetsQueryHandler : IRequestHandler<GetAssetsQuery, List<AssetDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAssetsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AssetDto>> Handle(GetAssetsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Assets
            .Where(a => a.OrganizationId == request.OrganizationId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AssetDto
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                Type = a.Type,
                Criticality = a.Criticality.ToString(),
                OwnerId = a.OwnerId,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
