using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Audits.DTOs;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Audits.Queries;

public class GetAuditsQuery : IRequest<List<AuditDto>>
{
}

public class GetAuditsQueryHandler : IRequestHandler<GetAuditsQuery, List<AuditDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditDto>> Handle(GetAuditsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Audits
            .Include(a => a.TargetFramework)
            .OrderByDescending(a => a.PlannedDate)
            .Select(a => new AuditDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Status = a.Status.ToString(),
                Result = a.Result.ToString(),
                PlannedDate = a.PlannedDate,
                CompletedDate = a.CompletedDate,
                TargetFrameworkName = a.TargetFramework != null ? a.TargetFramework.Name : ""
            })
            .ToListAsync(cancellationToken);
    }
}
