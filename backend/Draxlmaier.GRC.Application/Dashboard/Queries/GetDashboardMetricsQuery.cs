using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Dashboard.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Draxlmaier.GRC.Application.Dashboard.Queries;

public class GetDashboardMetricsQuery : IRequest<DashboardMetricsDto>
{
}

public class GetDashboardMetricsQueryHandler : IRequestHandler<GetDashboardMetricsQuery, DashboardMetricsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardMetricsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardMetricsDto> Handle(GetDashboardMetricsQuery request, CancellationToken cancellationToken)
    {
        var metrics = new DashboardMetricsDto();

        metrics.ActivePoliciesCount = await _context.Policies
            .CountAsync(p => p.Status == Domain.Enums.PolicyStatus.Active, cancellationToken);

        metrics.OpenRisksCount = await _context.Risks
            .CountAsync(r => r.Status == Domain.Enums.RiskStatus.Open || r.Status == Domain.Enums.RiskStatus.Mitigated, cancellationToken);

        metrics.HighSeverityRisksCount = await _context.Risks
            .Include(r => r.Assessments)
            .Where(r => r.Status != Domain.Enums.RiskStatus.Closed)
            .CountAsync(r => r.Assessments.OrderByDescending(a => a.AssessedAt).FirstOrDefault() != null && 
                             r.Assessments.OrderByDescending(a => a.AssessedAt).FirstOrDefault()!.Score >= 15, cancellationToken);

        metrics.TotalAuditsCount = await _context.Audits
            .CountAsync(cancellationToken);

        metrics.OpenFindingsCount = await _context.Findings
            .CountAsync(f => f.Status == Domain.Enums.FindingStatus.Open || f.Status == Domain.Enums.FindingStatus.InProgress, cancellationToken);

        metrics.OverdueActionsCount = await _context.CorrectiveActions
            .CountAsync(a => a.Status != Domain.Enums.CorrectiveActionStatus.Completed && a.DueDate.HasValue && a.DueDate.Value < System.DateTime.UtcNow, cancellationToken);

        var thirtyDaysFromNow = System.DateTime.UtcNow.AddDays(30);
        metrics.ExpiringPoliciesCount = await _context.Policies
            .CountAsync(p => p.Status == Domain.Enums.PolicyStatus.Active && p.ExpiryDate.HasValue && p.ExpiryDate.Value <= thirtyDaysFromNow, cancellationToken);

        // A requirement is compliant if it has at least one mapping with "Compliant" status
        var allReqs = await _context.ComplianceRequirements
            .Include(r => r.ControlMappings)
            .ToListAsync(cancellationToken);

        metrics.TotalRequirementsCount = allReqs.Count;
        
        metrics.CompliantRequirementsCount = allReqs.Count(r => 
            r.ControlMappings.Any(m => m.Status == Domain.Enums.ComplianceStatus.Compliant));
            
        metrics.NonCompliantRequirementsCount = allReqs.Count(r => 
            r.ControlMappings.Any(m => m.Status == Domain.Enums.ComplianceStatus.NonCompliant));

        // Chart 1: Risks By Severity (from RiskAssessments)
        var allRisks = await _context.Risks
            .Include(r => r.Assessments)
            .Where(r => r.Status != Domain.Enums.RiskStatus.Closed)
            .ToListAsync(cancellationToken);

        int low = 0, medium = 0, high = 0;
        foreach (var risk in allRisks)
        {
            var assessments = risk.Assessments.OrderByDescending(a => a.AssessedAt).ToList();
            var latestAssessment = assessments.FirstOrDefault();
            var previousAssessment = assessments.Skip(1).FirstOrDefault();

            var latestScore = latestAssessment?.Score ?? 0;
            if (latestScore >= 15) high++;
            else if (latestScore >= 8) medium++;
            else if (latestScore > 0) low++;

            if (latestAssessment != null)
            {
                var key = $"{latestAssessment.Probability}:{latestAssessment.Impact}";
                if (!metrics.RiskHeatmap.ContainsKey(key))
                    metrics.RiskHeatmap[key] = 0;
                metrics.RiskHeatmap[key]++;

                // Calculate Trajectory (1: Worsening, 0: Stable, -1: Improving)
                int trajectory = 0;
                if (previousAssessment != null)
                {
                    if (latestAssessment.Score > previousAssessment.Score) trajectory = 1;
                    else if (latestAssessment.Score < previousAssessment.Score) trajectory = -1;
                }

                metrics.RiskRadarNodes.Add(new RiskRadarNodeDto
                {
                    RiskId = risk.Id,
                    Code = string.IsNullOrEmpty(risk.Code) ? $"R-{risk.Id.ToString().Substring(0, 4).ToUpper()}" : risk.Code,
                    Title = risk.Title,
                    Probability = latestAssessment.Probability,
                    Impact = latestAssessment.Impact,
                    Score = latestScore,
                    Trajectory = trajectory
                });
            }
        }
        
        metrics.RisksBySeverity.Add("High", high);
        metrics.RisksBySeverity.Add("Medium", medium);
        metrics.RisksBySeverity.Add("Low", low);

        // Chart 2: Compliance By Framework
        var frameworks = await _context.ComplianceFrameworks.ToListAsync(cancellationToken);
        
        foreach (var fw in frameworks)
        {
            var reqsForFw = allReqs.Where(r => r.FrameworkId == fw.Id).ToList();
            int fwTotal = reqsForFw.Count;
            if (fwTotal > 0)
            {
                int fwCompliant = reqsForFw.Count(r => r.ControlMappings.Any(m => m.Status == Domain.Enums.ComplianceStatus.Compliant));
                metrics.ComplianceByFramework.Add(new FrameworkComplianceDto
                {
                    FrameworkId = fw.Id,
                    FrameworkName = fw.Name,
                    ComplianceScorePercentage = System.Math.Round((double)fwCompliant / fwTotal * 100, 2)
                });
            }
        }

        return metrics;
    }
}
