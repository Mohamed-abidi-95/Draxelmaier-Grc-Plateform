using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Organizations.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Organizations.Queries;

public record GetOrganizationByIdQuery(Guid Id) : IRequest<OrganizationDto?>;

public class GetOrganizationByIdQueryHandler : IRequestHandler<GetOrganizationByIdQuery, OrganizationDto?>
{
    private readonly IApplicationDbContext _context;

    public GetOrganizationByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrganizationDto?> Handle(GetOrganizationByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        return new OrganizationDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description ?? string.Empty
        };
    }
}
