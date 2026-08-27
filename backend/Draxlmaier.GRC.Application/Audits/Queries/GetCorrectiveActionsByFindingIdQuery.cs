using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Audits.DTOs;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Audits.Queries;

public record GetCorrectiveActionsByFindingIdQuery(Guid FindingId) : IRequest<List<CorrectiveActionDto>>;

public class GetCorrectiveActionsByFindingIdQueryHandler : IRequestHandler<GetCorrectiveActionsByFindingIdQuery, List<CorrectiveActionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCorrectiveActionsByFindingIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CorrectiveActionDto>> Handle(GetCorrectiveActionsByFindingIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.CorrectiveActions
            .Where(ca => ca.FindingId == request.FindingId)
            .Select(ca => new CorrectiveActionDto
            {
                Id = ca.Id,
                FindingId = ca.FindingId,
                Description = ca.Description,
                Status = ca.Status.ToString(),
                OwnerId = ca.OwnerId,
                CreatedAt = ca.CreatedAt,
                DueDate = ca.DueDate,
                CompletedAt = ca.CompletedAt
            })
            .OrderByDescending(ca => ca.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
