using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;

namespace Draxlmaier.GRC.Application.BusinessUnits;

public class CreateBusinessUnitCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid? ParentId { get; set; }
}

public class CreateBusinessUnitCommandHandler : IRequestHandler<CreateBusinessUnitCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBusinessUnitCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateBusinessUnitCommand request, CancellationToken cancellationToken)
    {
        var entity = new BusinessUnit
        {
            Name = request.Name,
            OrganizationId = request.OrganizationId,
            ParentId = request.ParentId
        };

        _context.BusinessUnits.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
