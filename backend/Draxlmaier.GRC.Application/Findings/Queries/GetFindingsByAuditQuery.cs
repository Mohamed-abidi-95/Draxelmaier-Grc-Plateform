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

public class GetFindingsByAuditQuery : IRequest<List<FindingDto>>
{
    public Guid AuditId { get; set; }
}

public class GetFindingsByAuditQueryHandler : IRequestHandler<GetFindingsByAuditQuery, List<FindingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFindingsByAuditQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FindingDto>> Handle(GetFindingsByAuditQuery request, CancellationToken cancellationToken)
    {
        return await _context.Findings
            .Include(f => f.Audit)
            .Where(f => f.AuditId == request.AuditId)
            .Select(f => new FindingDto
            {
                Id = f.Id,
                AuditId = f.AuditId,
                AuditTitle = f.Audit != null ? f.Audit.Title : string.Empty,
                Title = f.Title,
                Description = f.Description,
                Severity = f.Severity,
                Status = f.Status,
                AssigneeId = f.AssigneeId,
                AssigneeName = f.AssigneeId.ToString() ?? "",
                CreatedAt = f.CreatedAt,
                DueDate = f.DueDate,
                ResolvedAt = f.ResolvedAt
            })
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
