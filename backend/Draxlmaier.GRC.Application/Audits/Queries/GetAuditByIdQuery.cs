using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Audits.DTOs;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Audits.Queries;

public class GetAuditByIdQuery : IRequest<AuditDto?>
{
    public Guid Id { get; set; }
}

public class GetAuditByIdQueryHandler : IRequestHandler<GetAuditByIdQuery, AuditDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAuditByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuditDto?> Handle(GetAuditByIdQuery request, CancellationToken cancellationToken)
    {
        var audit = await _context.Audits
            .Include(a => a.TargetFramework)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (audit == null)
            return null;

        return new AuditDto
        {
            Id = audit.Id,
            Title = audit.Title,
            Description = audit.Description,
            Status = audit.Status.ToString(),
            Result = audit.Result.ToString(),
            PlannedDate = audit.PlannedDate,
            CompletedDate = audit.CompletedDate,
            TargetFrameworkName = audit.TargetFramework != null ? audit.TargetFramework.Name : ""
        };
    }
}
