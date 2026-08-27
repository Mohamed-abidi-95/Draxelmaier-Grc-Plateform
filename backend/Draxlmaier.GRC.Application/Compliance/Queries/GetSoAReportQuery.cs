using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Compliance.DTOs;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Queries;

public record GetSoAReportQuery(Guid FrameworkId) : IRequest<List<SoAReportItemDto>>;

public class GetSoAReportQueryHandler : IRequestHandler<GetSoAReportQuery, List<SoAReportItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSoAReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SoAReportItemDto>> Handle(GetSoAReportQuery request, CancellationToken cancellationToken)
    {
        var requirements = await _context.ComplianceRequirements
            .Include(r => r.ControlMappings)
                .ThenInclude(m => m.Policy)
            .Include(r => r.ControlMappings)
                .ThenInclude(m => m.Control)
            .Where(r => r.FrameworkId == request.FrameworkId)
            .OrderBy(r => r.Identifier)
            .ToListAsync(cancellationToken);

        var report = new List<SoAReportItemDto>();

        foreach (var req in requirements)
        {
            var item = new SoAReportItemDto
            {
                RequirementId = req.Id,
                Identifier = req.Identifier,
                Title = req.Title,
                Description = req.Description,
                IsApplicable = true, // Default
                Status = "NotAssessed"
            };

            if (req.ControlMappings.Any())
            {
                var mapping = req.ControlMappings.First(); // Assume 1 main mapping per requirement for the SoA context for simplicity
                
                item.IsApplicable = mapping.IsApplicable;
                item.Justification = mapping.Justification;
                item.Status = mapping.Status.ToString();

                foreach (var m in req.ControlMappings)
                {
                    if (m.Policy != null)
                    {
                        item.LinkedPolicies.Add(new SoALinkedItemDto { Id = m.Policy.Id, Name = m.Policy.Title });
                    }
                    if (m.Control != null)
                    {
                        item.LinkedControls.Add(new SoALinkedItemDto { Id = m.Control.Id, Name = m.Control.Name });
                    }
                }
            }

            report.Add(item);
        }

        return report;
    }
}
