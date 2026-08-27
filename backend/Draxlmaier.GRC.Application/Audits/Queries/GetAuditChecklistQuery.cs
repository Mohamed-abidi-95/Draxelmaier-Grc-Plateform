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

public record GetAuditChecklistQuery(Guid AuditId) : IRequest<List<AuditItemDto>>;

public class GetAuditChecklistQueryHandler : IRequestHandler<GetAuditChecklistQuery, List<AuditItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditChecklistQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditItemDto>> Handle(GetAuditChecklistQuery request, CancellationToken cancellationToken)
    {
        return await _context.AuditItems
            .Where(x => x.AuditId == request.AuditId)
            .OrderBy(x => x.Id)
            .Select(x => new AuditItemDto
            {
                Id = x.Id,
                AuditId = x.AuditId,
                Requirement = x.Requirement,
                Status = x.Status.ToString(),
                Comments = x.Comments,
                EvidenceId = x.EvidenceId
            })
            .ToListAsync(cancellationToken);
    }
}
