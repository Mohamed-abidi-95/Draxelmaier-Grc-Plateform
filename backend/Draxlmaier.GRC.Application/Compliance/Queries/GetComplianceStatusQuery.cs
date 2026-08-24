using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Compliance.DTOs;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Compliance.Queries
{
    public class GetComplianceStatusQuery : IRequest<ComplianceStatusDto?>
    {
        public Guid FrameworkId { get; set; }
    }

    public class GetComplianceStatusQueryHandler : IRequestHandler<GetComplianceStatusQuery, ComplianceStatusDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetComplianceStatusQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ComplianceStatusDto?> Handle(GetComplianceStatusQuery request, CancellationToken cancellationToken)
        {
            var framework = await _context.ComplianceFrameworks
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == request.FrameworkId, cancellationToken);

            if (framework == null)
            {
                return null;
            }

            var requirements = await _context.ComplianceRequirements
                .AsNoTracking()
                .Where(r => r.FrameworkId == request.FrameworkId)
                .Select(r => new
                {
                    r.Id,
                    // Subquery to check if there is at least one mapping that is Compliant
                    IsCompliant = _context.ControlMappings.Any(m => m.RequirementId == r.Id && m.Status == ComplianceStatus.Compliant),
                    IsNonCompliant = _context.ControlMappings.Any(m => m.RequirementId == r.Id && m.Status == ComplianceStatus.NonCompliant),
                    HasMappings = _context.ControlMappings.Any(m => m.RequirementId == r.Id)
                })
                .ToListAsync(cancellationToken);

            int total = requirements.Count;
            if (total == 0)
            {
                return new ComplianceStatusDto
                {
                    FrameworkId = framework.Id,
                    FrameworkName = framework.Name,
                    TotalRequirements = 0,
                    ComplianceScorePercentage = 0
                };
            }

            int compliant = requirements.Count(r => r.IsCompliant);
            int nonCompliant = requirements.Count(r => !r.IsCompliant && r.IsNonCompliant);
            int notAssessed = total - compliant - nonCompliant;

            double percentage = Math.Round((double)compliant / total * 100, 2);

            return new ComplianceStatusDto
            {
                FrameworkId = framework.Id,
                FrameworkName = framework.Name,
                TotalRequirements = total,
                CompliantRequirements = compliant,
                NonCompliantRequirements = nonCompliant,
                NotAssessedRequirements = notAssessed,
                ComplianceScorePercentage = percentage
            };
        }
    }
}
