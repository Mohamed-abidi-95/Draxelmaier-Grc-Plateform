using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record UpdateCorrectiveActionStatusCommand(Guid ActionId, CorrectiveActionStatus Status) : IRequest;

public class UpdateCorrectiveActionStatusCommandHandler : IRequestHandler<UpdateCorrectiveActionStatusCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateCorrectiveActionStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateCorrectiveActionStatusCommand request, CancellationToken cancellationToken)
    {
        var action = await _context.CorrectiveActions.FindAsync(new object[] { request.ActionId }, cancellationToken);
        
        if (action == null)
            throw new Exception("Corrective Action not found");

        action.Status = request.Status;
        
        if (request.Status == CorrectiveActionStatus.Completed || request.Status == CorrectiveActionStatus.Verified)
        {
            action.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
