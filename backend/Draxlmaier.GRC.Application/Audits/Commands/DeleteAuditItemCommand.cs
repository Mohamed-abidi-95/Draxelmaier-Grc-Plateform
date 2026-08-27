using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public record DeleteAuditItemCommand(Guid Id) : IRequest<bool>;

public class DeleteAuditItemCommandHandler : IRequestHandler<DeleteAuditItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteAuditItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteAuditItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.AuditItems.FindAsync(new object[] { request.Id }, cancellationToken);
        if (item == null) return false;

        _context.AuditItems.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
