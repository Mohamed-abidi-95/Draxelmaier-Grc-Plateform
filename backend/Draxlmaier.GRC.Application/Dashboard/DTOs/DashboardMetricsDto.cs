namespace Draxlmaier.GRC.Application.Dashboard.DTOs;

public class DashboardMetricsDto
{
    public int ActivePoliciesCount { get; set; }
    public int OpenRisksCount { get; set; }
    public int HighSeverityRisksCount { get; set; }
    public int TotalAuditsCount { get; set; }
    
    // Compliance Metrics
    public int TotalRequirementsCount { get; set; }
    public int CompliantRequirementsCount { get; set; }
    public int NonCompliantRequirementsCount { get; set; }
    
    public double ComplianceRate => TotalRequirementsCount > 0 
        ? (double)CompliantRequirementsCount / TotalRequirementsCount * 100 
        : 0;

    // Charts Data
    public System.Collections.Generic.Dictionary<string, int> RisksBySeverity { get; set; } = new();
    public System.Collections.Generic.Dictionary<string, int> RiskHeatmap { get; set; } = new(); // format: "P:I" -> count
    public System.Collections.Generic.List<RiskRadarNodeDto> RiskRadarNodes { get; set; } = new();
    public System.Collections.Generic.List<FrameworkComplianceDto> ComplianceByFramework { get; set; } = new();

    // Findings & Actions Metrics
    public int OpenFindingsCount { get; set; }
    public int OverdueActionsCount { get; set; }
    public int ExpiringPoliciesCount { get; set; }
}

public class FrameworkComplianceDto
{
    public System.Guid FrameworkId { get; set; }
    public string FrameworkName { get; set; } = string.Empty;
    public double ComplianceScorePercentage { get; set; }
}

public class RiskRadarNodeDto
{
    public System.Guid RiskId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Probability { get; set; }
    public int Impact { get; set; }
    public int Trajectory { get; set; } // 1: Worsening, 0: Stable, -1: Improving
    public int Score { get; set; }
}
