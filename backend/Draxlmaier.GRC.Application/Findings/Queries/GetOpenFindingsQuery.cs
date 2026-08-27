using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Findings.DTOs;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Findings.Queries;

public class GetOpenFindingsQuery : IRequest<List<FindingDto>>
{
}

public class GetOpenFindingsQueryHandler : IRequestHandler<GetOpenFindingsQuery, List<FindingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOpenFindingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FindingDto>> Handle(GetOpenFindingsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Findings
            .Include(f => f.Audit)
            .Where(f => f.Status == FindingStatus.Open || f.Status == FindingStatus.InProgress)
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
                AssigneeName = f.AssigneeId.ToString() ?? "", // Mock
                CreatedAt = f.CreatedAt,
                DueDate = f.DueDate,
                ResolvedAt = f.ResolvedAt
            })
            .OrderBy(f => f.DueDate)
            .ToListAsync(cancellationToken);
    }
}
