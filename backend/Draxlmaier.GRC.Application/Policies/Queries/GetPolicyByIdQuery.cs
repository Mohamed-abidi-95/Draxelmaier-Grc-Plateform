using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Policies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Policies.Queries;

public record GetPolicyByIdQuery(Guid Id) : IRequest<PolicyDto?>;

public class GetPolicyByIdQueryHandler : IRequestHandler<GetPolicyByIdQuery, PolicyDto?>
{
    private readonly IApplicationDbContext _context;

    public GetPolicyByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PolicyDto?> Handle(GetPolicyByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Policies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        return new PolicyDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            Status = entity.Status,
            OrganizationId = entity.OrganizationId,
            ExpiryDate = entity.ExpiryDate,
            DocumentId = entity.DocumentId,
            OwnerId = entity.OwnerId
        };
    }
}
