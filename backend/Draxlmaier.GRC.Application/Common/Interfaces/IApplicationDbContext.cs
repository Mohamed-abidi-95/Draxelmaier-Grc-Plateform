using Draxlmaier.GRC.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Organization> Organizations { get; }
    DbSet<Asset> Assets { get; }
    DbSet<Risk> Risks { get; }
    DbSet<RiskAssessment> RiskAssessments { get; }
    DbSet<Document> Documents { get; }
    DbSet<Policy> Policies { get; }
    DbSet<PolicyReview> PolicyReviews { get; }
    
    DbSet<ComplianceFramework> ComplianceFrameworks { get; }
    DbSet<ComplianceRequirement> ComplianceRequirements { get; }
    DbSet<Control> Controls { get; }
    DbSet<ControlMapping> ControlMappings { get; }
    DbSet<Evidence> Evidences { get; }
    DbSet<Audit> Audits { get; }
    DbSet<Finding> Findings { get; }
    DbSet<CorrectiveAction> CorrectiveActions { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<RiskTreatment> RiskTreatments { get; }
    DbSet<RiskControl> RiskControls { get; }
    DbSet<BusinessUnit> BusinessUnits { get; }
    DbSet<AuditItem> AuditItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
