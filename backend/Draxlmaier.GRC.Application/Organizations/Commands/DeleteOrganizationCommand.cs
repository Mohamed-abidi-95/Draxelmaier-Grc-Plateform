using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Organizations.Commands;

public record DeleteOrganizationCommand(Guid Id) : IRequest<bool>;

public class DeleteOrganizationCommandHandler : IRequestHandler<DeleteOrganizationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteOrganizationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteOrganizationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Organizations.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null) return false;

        _context.Organizations.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
