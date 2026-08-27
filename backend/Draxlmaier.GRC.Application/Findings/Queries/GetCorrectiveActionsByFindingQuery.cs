using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Findings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Findings.Queries;

public class GetCorrectiveActionsByFindingQuery : IRequest<List<CorrectiveActionDto>>
{
    public Guid FindingId { get; set; }
}

public class GetCorrectiveActionsByFindingQueryHandler : IRequestHandler<GetCorrectiveActionsByFindingQuery, List<CorrectiveActionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCorrectiveActionsByFindingQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CorrectiveActionDto>> Handle(GetCorrectiveActionsByFindingQuery request, CancellationToken cancellationToken)
    {
        return await _context.CorrectiveActions
            .Where(a => a.FindingId == request.FindingId)
            .Select(a => new CorrectiveActionDto
            {
                Id = a.Id,
                FindingId = a.FindingId,
                Description = a.Description,
                Status = a.Status,
                OwnerId = a.OwnerId,
                OwnerName = a.OwnerId.ToString() ?? "",
                CreatedAt = a.CreatedAt,
                DueDate = a.DueDate,
                CompletedAt = a.CompletedAt
            })
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
