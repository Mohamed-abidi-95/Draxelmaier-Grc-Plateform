using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Risks.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Risks.Queries;

public class GetRiskAssessmentsQuery : IRequest<List<RiskAssessmentDto>>
{
    public Guid? RiskId { get; set; }
}

public class GetRiskAssessmentsQueryHandler : IRequestHandler<GetRiskAssessmentsQuery, List<RiskAssessmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRiskAssessmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RiskAssessmentDto>> Handle(GetRiskAssessmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Risks
            .Include(r => r.Assessments)
            .AsQueryable();

        if (request.RiskId.HasValue)
        {
            query = query.Where(r => r.Id == request.RiskId.Value);
        }

        var risks = await query.ToListAsync(cancellationToken);
        
        var assessments = risks.SelectMany(r => r.Assessments.Select(a => new RiskAssessmentDto
        {
            Id = a.Id,
            RiskId = r.Id,
            RiskTitle = r.Title,
            Probability = a.Probability,
            Impact = a.Impact,
            Score = a.Score,
            AssessorId = a.AssessorId,
            AssessedAt = a.AssessedAt
        })).OrderByDescending(a => a.AssessedAt).ToList();

        return assessments;
    }
}
