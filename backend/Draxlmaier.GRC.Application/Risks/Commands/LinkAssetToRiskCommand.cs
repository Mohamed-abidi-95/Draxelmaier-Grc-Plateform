using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;

namespace Draxlmaier.GRC.Application.Risks.Commands;

public class LinkAssetToRiskCommand : IRequest<bool>
{
    public Guid RiskId { get; set; }
    public Guid? AssetId { get; set; }
}

public class LinkAssetToRiskCommandHandler : IRequestHandler<LinkAssetToRiskCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public LinkAssetToRiskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(LinkAssetToRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = await _context.Risks.FindAsync(new object[] { request.RiskId }, cancellationToken);
        if (risk == null) return false;

        if (request.AssetId.HasValue)
        {
            var asset = await _context.Assets.FindAsync(new object[] { request.AssetId.Value }, cancellationToken);
            if (asset == null) return false;
            risk.AssetId = asset.Id;
        }
        else
        {
            // Unlink asset
            risk.AssetId = null;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
