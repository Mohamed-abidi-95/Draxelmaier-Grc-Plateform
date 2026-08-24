using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.DTOs;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Audits.Queries;

public class GetAuditLogsQuery : IRequest<List<AuditLogDto>>
{
}

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, List<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetAuditLogsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<List<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(x => x.Timestamp)
            .Take(100) // Limiting to latest 100 for performance on MVP
            .ToListAsync(cancellationToken);

        var result = new List<AuditLogDto>();

        foreach (var log in logs)
        {
            var userName = "System";
            if (log.UserId.HasValue)
            {
                var name = await _identityService.GetUserNameAsync(log.UserId.Value);
                if (!string.IsNullOrEmpty(name))
                {
                    userName = name;
                }
            }

            result.Add(new AuditLogDto
            {
                Id = log.Id,
                EntityName = log.EntityName,
                Action = log.Action,
                Timestamp = log.Timestamp,
                Changes = log.Changes,
                UserId = log.UserId,
                UserName = userName
            });
        }

        return result;
    }
}
