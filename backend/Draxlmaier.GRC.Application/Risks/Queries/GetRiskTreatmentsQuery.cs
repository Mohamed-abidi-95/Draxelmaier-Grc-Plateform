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

public class GetRiskTreatmentsQuery : IRequest<List<RiskTreatmentDto>>
{
    public Guid? RiskId { get; set; }
}

public class GetRiskTreatmentsQueryHandler : IRequestHandler<GetRiskTreatmentsQuery, List<RiskTreatmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRiskTreatmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RiskTreatmentDto>> Handle(GetRiskTreatmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Risks
            .Include(r => r.Treatments)
            .AsQueryable();

        if (request.RiskId.HasValue)
        {
            query = query.Where(r => r.Id == request.RiskId.Value);
        }

        var risks = await query.ToListAsync(cancellationToken);
        
        var treatments = risks.SelectMany(r => r.Treatments.Select(t => new RiskTreatmentDto
        {
            Id = t.Id,
            RiskId = r.Id,
            RiskTitle = r.Title,
            Type = t.Type.ToString(),
            Description = t.Description,
            DueDate = t.DueDate
        })).OrderBy(t => t.DueDate ?? DateTime.MaxValue).ToList();

        return treatments;
    }
}
