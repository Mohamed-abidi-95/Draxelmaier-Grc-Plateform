using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record AddAuditItemCommand(Guid AuditId, string Requirement) : IRequest<Guid>;

public class AddAuditItemCommandHandler : IRequestHandler<AddAuditItemCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public AddAuditItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddAuditItemCommand request, CancellationToken cancellationToken)
    {
        var auditItem = new AuditItem
        {
            Id = Guid.NewGuid(),
            AuditId = request.AuditId,
            Requirement = request.Requirement,
            Status = AuditItemStatus.Pending
        };

        _context.AuditItems.Add(auditItem);
        await _context.SaveChangesAsync(cancellationToken);

        return auditItem.Id;
    }
}
