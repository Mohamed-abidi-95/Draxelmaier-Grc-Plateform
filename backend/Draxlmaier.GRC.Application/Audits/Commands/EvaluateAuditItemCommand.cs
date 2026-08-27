using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record EvaluateAuditItemCommand(Guid Id, AuditItemStatus Status, string? Comments) : IRequest<bool>;

public class EvaluateAuditItemCommandHandler : IRequestHandler<EvaluateAuditItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public EvaluateAuditItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(EvaluateAuditItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.AuditItems.FindAsync(new object[] { request.Id }, cancellationToken);
        if (item == null) return false;

        item.Status = request.Status;
        if (request.Comments != null)
        {
            item.Comments = request.Comments;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
