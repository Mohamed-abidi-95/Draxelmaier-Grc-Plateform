using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Findings.Commands;

public class CreateFindingCommand : IRequest<Guid>
{
    public Guid AuditId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public FindingSeverity Severity { get; set; }
    public Guid? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
}

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
            throw new Exception("Audit not found.");

        var finding = new Finding
        {
            Id = Guid.NewGuid(),
            AuditId = request.AuditId,
            Title = request.Title,
            Description = request.Description,
            Severity = request.Severity,
            AssigneeId = request.AssigneeId,
            DueDate = request.DueDate,
            Status = FindingStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _context.Findings.Add(finding);
        await _context.SaveChangesAsync(cancellationToken);

        return finding.Id;
    }
}
