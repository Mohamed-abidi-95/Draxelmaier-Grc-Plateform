using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public record UpdatePolicyCommand(Guid Id, string Title, string Description, DateTime? ExpiryDate, PolicyStatus Status) : IRequest<bool>;

public class UpdatePolicyCommandHandler : IRequestHandler<UpdatePolicyCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdatePolicyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdatePolicyCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Policies.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null) return false;

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.ExpiryDate = request.ExpiryDate;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
