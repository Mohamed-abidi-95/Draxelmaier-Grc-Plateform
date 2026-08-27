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

public record GetFindingsByAuditIdQuery(Guid AuditId) : IRequest<List<FindingDto>>;

public class GetFindingsByAuditIdQueryHandler : IRequestHandler<GetFindingsByAuditIdQuery, List<FindingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFindingsByAuditIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FindingDto>> Handle(GetFindingsByAuditIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Findings
            .Where(f => f.AuditId == request.AuditId)
            .Select(f => new FindingDto
            {
                Id = f.Id,
                AuditId = f.AuditId,
                Title = f.Title,
                Description = f.Description,
                Severity = f.Severity.ToString(),
                Status = f.Status.ToString(),
                AssigneeId = f.AssigneeId,
                CreatedAt = f.CreatedAt,
                DueDate = f.DueDate,
                ResolvedAt = f.ResolvedAt
            })
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
