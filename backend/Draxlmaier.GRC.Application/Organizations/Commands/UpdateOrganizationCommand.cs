using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Organizations.Commands;

public record UpdateOrganizationCommand(Guid Id, string Name, string? Description) : IRequest<bool>;

public class UpdateOrganizationCommandHandler : IRequestHandler<UpdateOrganizationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateOrganizationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Organizations.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null) return false;

        entity.Name = request.Name;
        entity.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
