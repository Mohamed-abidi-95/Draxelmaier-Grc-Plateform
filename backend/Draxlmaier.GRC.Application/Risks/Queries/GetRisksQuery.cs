using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Risks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Risks.Queries;

public class GetRisksQuery : IRequest<List<RiskDto>>
{
}

public class GetRisksQueryHandler : IRequestHandler<GetRisksQuery, List<RiskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetRisksQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<List<RiskDto>> Handle(GetRisksQuery request, CancellationToken cancellationToken)
    {
        var risks = await _context.Risks
            .Include(r => r.Assessments)
            .Include(r => r.RiskControls)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        var result = new List<RiskDto>();
        foreach(var r in risks)
        {
            var ownerName = await _identityService.GetUserNameAsync(r.OwnerId);
            result.Add(new RiskDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Code = r.Code ?? string.Empty,
                Category = r.Category ?? string.Empty,
                Status = r.Status.ToString(),
                OrganizationId = r.OrganizationId,
                OwnerId = r.OwnerId,
                OwnerName = ownerName,
                ControlsCount = r.RiskControls?.Count ?? 0,
                CreatedAt = r.CreatedAt,
                Assessments = r.Assessments.Select(a => new RiskAssessmentDto
            {
                Id = a.Id,
                RiskId = r.Id,
                RiskTitle = r.Title,
                Probability = a.Probability,
                Impact = a.Impact,
                Score = a.Score,
                AssessorId = a.AssessorId,
                AssessedAt = a.AssessedAt
            }).ToList()
            });
        }
        
        return result;
    }
}
