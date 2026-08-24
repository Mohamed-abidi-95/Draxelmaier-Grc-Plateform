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
    public System.Collections.Generic.List<FrameworkComplianceDto> ComplianceByFramework { get; set; } = new();
}

public class FrameworkComplianceDto
{
    public System.Guid FrameworkId { get; set; }
    public string FrameworkName { get; set; } = string.Empty;
    public double ComplianceScorePercentage { get; set; }
}
