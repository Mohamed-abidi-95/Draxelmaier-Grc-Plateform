using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public record DeletePolicyCommand(Guid Id) : IRequest<bool>;

public class DeletePolicyCommandHandler : IRequestHandler<DeletePolicyCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeletePolicyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeletePolicyCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Policies.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null) return false;

        _context.Policies.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
