using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public class UpdateAuditResultCommand : IRequest<bool>
{
    public Guid AuditId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
}

public class UpdateAuditResultCommandHandler : IRequestHandler<UpdateAuditResultCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateAuditResultCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateAuditResultCommand request, CancellationToken cancellationToken)
    {
        var audit = await _context.Audits.FirstOrDefaultAsync(a => a.Id == request.AuditId, cancellationToken);
        if (audit == null) return false;

        if (Enum.TryParse<AuditStatus>(request.Status, true, out var status))
            audit.Status = status;

        if (Enum.TryParse<AuditResult>(request.Result, true, out var result))
            audit.Result = result;

        if (audit.Status == AuditStatus.Completed && audit.CompletedDate == null)
            audit.CompletedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
