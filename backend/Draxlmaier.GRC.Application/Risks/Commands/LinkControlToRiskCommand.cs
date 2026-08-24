using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Risks.Commands;

public class LinkControlToRiskCommand : IRequest<bool>
{
    public Guid RiskId { get; set; }
    public Guid ControlId { get; set; }
}

public class LinkControlToRiskCommandHandler : IRequestHandler<LinkControlToRiskCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public LinkControlToRiskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(LinkControlToRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = await _context.Risks.FindAsync(new object[] { request.RiskId }, cancellationToken);
        if (risk == null) return false;

        var control = await _context.Controls.FindAsync(new object[] { request.ControlId }, cancellationToken);
        if (control == null) return false;

        var exists = await _context.RiskControls
            .AnyAsync(rc => rc.RiskId == request.RiskId && rc.ControlId == request.ControlId, cancellationToken);
            
        if (exists) return true; // Already linked

        _context.RiskControls.Add(new RiskControl
        {
            RiskId = request.RiskId,
            ControlId = request.ControlId
        });

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
