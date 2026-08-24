using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Risks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Risks.Queries;

public class GetRiskByIdQuery : IRequest<RiskDto>
{
    public Guid Id { get; set; }
}

public class GetRiskByIdQueryHandler : IRequestHandler<GetRiskByIdQuery, RiskDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetRiskByIdQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<RiskDto> Handle(GetRiskByIdQuery request, CancellationToken cancellationToken)
    {
        var risk = await _context.Risks
            .Include(r => r.Asset)
            .Include(r => r.Assessments)
            .Include(r => r.RiskControls)
                .ThenInclude(rc => rc.Control)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (risk == null) return null;

        var ownerName = await _identityService.GetUserNameAsync(risk.OwnerId);

        return new RiskDto
        {
            Id = risk.Id,
            Title = risk.Title,
            Description = risk.Description,
            Code = risk.Code ?? string.Empty,
            Category = risk.Category ?? string.Empty,
            Status = risk.Status.ToString(),
            OrganizationId = risk.OrganizationId,
            OwnerId = risk.OwnerId,
            OwnerName = ownerName,
            AssetId = risk.AssetId,
            AssetName = risk.Asset?.Name ?? string.Empty,
            ControlsCount = risk.RiskControls?.Count ?? 0,
            CreatedAt = risk.CreatedAt,
            LinkedControls = risk.RiskControls?.Select(rc => new RiskControlDto
            {
                ControlId = rc.ControlId,
                ControlName = rc.Control?.Name ?? string.Empty
            }).ToList() ?? new List<RiskControlDto>(),
            Assessments = risk.Assessments.Select(a => new RiskAssessmentDto
            {
                Id = a.Id,
                RiskId = risk.Id,
                RiskTitle = risk.Title,
                Probability = a.Probability,
                Impact = a.Impact,
                Score = a.Score,
                AssessorId = a.AssessorId,
                AssessedAt = a.AssessedAt
            }).ToList()
        };
    }
}
