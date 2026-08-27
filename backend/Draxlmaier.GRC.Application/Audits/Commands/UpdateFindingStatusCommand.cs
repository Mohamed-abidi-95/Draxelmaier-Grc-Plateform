using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record UpdateFindingStatusCommand(Guid FindingId, FindingStatus Status) : IRequest;

public class UpdateFindingStatusCommandHandler : IRequestHandler<UpdateFindingStatusCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateFindingStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateFindingStatusCommand request, CancellationToken cancellationToken)
    {
        var finding = await _context.Findings.FindAsync(new object[] { request.FindingId }, cancellationToken);
        
        if (finding == null)
            throw new Exception("Finding not found");

        finding.Status = request.Status;
        
        if (request.Status == FindingStatus.Resolved || request.Status == FindingStatus.Closed)
        {
            finding.ResolvedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
