using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Commands;

public record UpdateSoAMappingCommand(Guid RequirementId, bool IsApplicable, string Justification) : IRequest<bool>;

public class UpdateSoAMappingCommandHandler : IRequestHandler<UpdateSoAMappingCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateSoAMappingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateSoAMappingCommand request, CancellationToken cancellationToken)
    {
        // Find existing mapping or create one
        var mapping = await _context.ControlMappings
            .FirstOrDefaultAsync(m => m.RequirementId == request.RequirementId, cancellationToken);

        if (mapping == null)
        {
            mapping = new Domain.Entities.ControlMapping
            {
                Id = Guid.NewGuid(),
                RequirementId = request.RequirementId,
                IsApplicable = request.IsApplicable,
                Justification = request.Justification,
                Status = Domain.Enums.ComplianceStatus.NotAssessed
            };
            _context.ControlMappings.Add(mapping);
        }
        else
        {
            mapping.IsApplicable = request.IsApplicable;
            mapping.Justification = request.Justification;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
