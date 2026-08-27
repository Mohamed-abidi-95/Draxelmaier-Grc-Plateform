using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Findings.Commands;

public class CreateCorrectiveActionCommand : IRequest<Guid>
{
    public Guid FindingId { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid? OwnerId { get; set; }
    public DateTime? DueDate { get; set; }
}

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
            throw new Exception("Finding not found.");

        var action = new CorrectiveAction
        {
            Id = Guid.NewGuid(),
            FindingId = request.FindingId,
            Description = request.Description,
            OwnerId = request.OwnerId,
            DueDate = request.DueDate,
            Status = CorrectiveActionStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.CorrectiveActions.Add(action);
        await _context.SaveChangesAsync(cancellationToken);

        return action.Id;
    }
}
