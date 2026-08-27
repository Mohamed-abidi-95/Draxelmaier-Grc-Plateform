using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record CreateCorrectiveActionCommand(
    Guid FindingId,
    string Description,
    DateTime? DueDate,
    Guid? OwnerId) : IRequest<Guid>;

public class CreateCorrectiveActionCommandHandler : IRequestHandler<CreateCorrectiveActionCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCorrectiveActionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCorrectiveActionCommand request, CancellationToken cancellationToken)
    {
        var finding = await _context.Findings.FindAsync(new object[] { request.FindingId }, cancellationToken);
        if (finding == null)
            throw new Exception("Finding not found");

        var correctiveAction = new CorrectiveAction
        {
            Id = Guid.NewGuid(),
            FindingId = request.FindingId,
            Description = request.Description,
            Status = CorrectiveActionStatus.Pending,
            DueDate = request.DueDate,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        _context.CorrectiveActions.Add(correctiveAction);
        await _context.SaveChangesAsync(cancellationToken);

        return correctiveAction.Id;
    }
}
