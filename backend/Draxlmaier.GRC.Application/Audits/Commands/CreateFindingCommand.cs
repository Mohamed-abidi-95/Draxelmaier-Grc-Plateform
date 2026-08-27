using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record CreateFindingCommand(
    Guid AuditId,
    string Title,
    string Description,
    FindingSeverity Severity,
    DateTime? DueDate,
    Guid? AssigneeId) : IRequest<Guid>;

public class CreateFindingCommandHandler : IRequestHandler<CreateFindingCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateFindingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFindingCommand request, CancellationToken cancellationToken)
    {
        var audit = await _context.Audits.FindAsync(new object[] { request.AuditId }, cancellationToken);
        if (audit == null)
            throw new Exception("Audit not found");

        var finding = new Finding
        {
            Id = Guid.NewGuid(),
            AuditId = request.AuditId,
            Title = request.Title,
            Description = request.Description,
            Severity = request.Severity,
            Status = FindingStatus.Open,
            DueDate = request.DueDate,
            AssigneeId = request.AssigneeId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Findings.Add(finding);
        await _context.SaveChangesAsync(cancellationToken);

        return finding.Id;
    }
}
