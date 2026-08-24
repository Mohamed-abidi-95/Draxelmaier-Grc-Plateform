using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Assets.Commands;

public class CreateAssetCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Criticality { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid OwnerId { get; set; }
}

public class CreateAssetCommandHandler : IRequestHandler<CreateAssetCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateAssetCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAssetCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<AssetCriticality>(request.Criticality, true, out var criticalityEnum))
        {
            criticalityEnum = AssetCriticality.Medium; // Default if parsing fails
        }

        var asset = new Asset
        {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Criticality = criticalityEnum,
            OrganizationId = request.OrganizationId,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync(cancellationToken);

        // TODO: AuditLog - CreateAsset

        return asset.Id;
    }
}
