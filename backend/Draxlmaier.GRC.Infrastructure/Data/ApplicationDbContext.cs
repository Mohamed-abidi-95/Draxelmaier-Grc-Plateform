using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Draxlmaier.GRC.Application.Common.Interfaces;
using System;

using System.Text.Json;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>, IApplicationDbContext
    {
        private readonly ICurrentUserService _currentUserService;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            ICurrentUserService currentUserService)
            : base(options)
        {
            _currentUserService = currentUserService;
        }

        public DbSet<Organization> Organizations => Set<Organization>();
        public DbSet<Asset> Assets => Set<Asset>();
        public DbSet<Risk> Risks => Set<Risk>();
        public DbSet<RiskAssessment> RiskAssessments => Set<RiskAssessment>();
        public DbSet<Document> Documents => Set<Document>();
        public DbSet<Policy> Policies => Set<Policy>();
        public DbSet<ComplianceFramework> ComplianceFrameworks => Set<ComplianceFramework>();
        public DbSet<ComplianceRequirement> ComplianceRequirements => Set<ComplianceRequirement>();
        public DbSet<Control> Controls => Set<Control>();
        public DbSet<ControlMapping> ControlMappings => Set<ControlMapping>();
        public DbSet<Evidence> Evidences => Set<Evidence>();
        public DbSet<Audit> Audits => Set<Audit>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<RiskTreatment> RiskTreatments => Set<RiskTreatment>();
        public DbSet<RiskControl> RiskControls => Set<RiskControl>();
        public DbSet<BusinessUnit> BusinessUnits => Set<BusinessUnit>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Critical for Identity

            // Audit configuration
            modelBuilder.Entity<Audit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Status).HasConversion<string>();
                entity.Property(e => e.Result).HasConversion<string>();
                entity.HasOne(e => e.Organization).WithMany().HasForeignKey(e => e.OrganizationId);
                entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(e => e.AuditorId);
                entity.HasOne(e => e.TargetFramework).WithMany().HasForeignKey(e => e.TargetFrameworkId).IsRequired(false);
            });

            // Organization configuration
            modelBuilder.Entity<Organization>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
            });

            // BusinessUnit configuration
            modelBuilder.Entity<BusinessUnit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.HasOne(e => e.Organization).WithMany(o => o.BusinessUnits).HasForeignKey(e => e.OrganizationId);
                entity.HasOne(e => e.Parent).WithMany(p => p.Children).HasForeignKey(e => e.ParentId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
            });

            // ApplicationUser configuration
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.HasOne<Organization>()
                      .WithMany()
                      .HasForeignKey(u => u.OrganizationId)
                      .IsRequired();
            });

            // Asset configuration
            modelBuilder.Entity<Asset>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Criticality).HasConversion<string>();
                entity.HasOne(e => e.Organization).WithMany().HasForeignKey(e => e.OrganizationId);
                entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(e => e.OwnerId);
            });

            // Risk configuration
            modelBuilder.Entity<Risk>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Status).HasConversion<string>(); // Save enum as string
                entity.HasOne(e => e.Organization).WithMany().HasForeignKey(e => e.OrganizationId);
                entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(e => e.OwnerId);
                entity.HasOne(e => e.Asset).WithMany(a => a.Risks).HasForeignKey(e => e.AssetId).IsRequired(false);
                entity.HasOne(e => e.BusinessUnit).WithMany(bu => bu.Risks).HasForeignKey(e => e.BusinessUnitId).IsRequired(false);
            });

            // RiskAssessment configuration
            modelBuilder.Entity<RiskAssessment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Risk).WithMany(r => r.Assessments).HasForeignKey(e => e.RiskId);
                entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(e => e.AssessorId);
            });
            
            // RiskTreatment configuration
            modelBuilder.Entity<RiskTreatment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).HasConversion<string>();
                entity.HasOne(e => e.Risk).WithMany(r => r.Treatments).HasForeignKey(e => e.RiskId);
            });

            // RiskControl configuration
            modelBuilder.Entity<RiskControl>(entity =>
            {
                entity.HasKey(e => new { e.RiskId, e.ControlId });
                entity.HasOne(e => e.Risk).WithMany(r => r.RiskControls).HasForeignKey(e => e.RiskId);
                entity.HasOne(e => e.Control).WithMany(c => c.RiskControls).HasForeignKey(e => e.ControlId);
            });
            
            // ComplianceFramework configuration
            modelBuilder.Entity<ComplianceFramework>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.Property(e => e.Version).HasMaxLength(50);
            });

            // ComplianceRequirement configuration
            modelBuilder.Entity<ComplianceRequirement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Framework).WithMany(f => f.Requirements).HasForeignKey(e => e.FrameworkId);
                entity.Property(e => e.Identifier).IsRequired().HasMaxLength(100);
            });

            // Control configuration
            modelBuilder.Entity<Control>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Organization).WithMany().HasForeignKey(e => e.OrganizationId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
                entity.HasOne(e => e.BusinessUnit).WithMany(bu => bu.Controls).HasForeignKey(e => e.BusinessUnitId).IsRequired(false);
            });

            // ControlMapping configuration
            modelBuilder.Entity<ControlMapping>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Requirement).WithMany(r => r.ControlMappings).HasForeignKey(e => e.RequirementId);
                entity.HasOne(e => e.Policy).WithMany(p => p.ControlMappings).HasForeignKey(e => e.PolicyId).IsRequired(false);
                entity.HasOne(e => e.Control).WithMany(c => c.ControlMappings).HasForeignKey(e => e.ControlId).IsRequired(false);
                entity.Property(e => e.Status).HasConversion<string>();
                entity.Property(e => e.Origin).HasConversion<string>();
            });
            
            // Evidence configuration
            modelBuilder.Entity<Evidence>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ControlMapping).WithMany(cm => cm.Evidences).HasForeignKey(e => e.ControlMappingId);
                entity.HasOne(e => e.Document).WithMany().HasForeignKey(e => e.DocumentId);
                entity.Property(e => e.Description).HasMaxLength(500);
            });
            
            // Phase 3: RAG with pgvector
            modelBuilder.HasPostgresExtension("vector");

            // Policy configuration
            modelBuilder.Entity<Policy>(entity =>
            {
                entity.HasOne(e => e.BusinessUnit).WithMany(bu => bu.Policies).HasForeignKey(e => e.BusinessUnitId).IsRequired(false);
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = new List<AuditLog>();
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is not AuditLog && 
                       (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
                .ToList();

            foreach (var entry in entries)
            {
                var auditLog = new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EntityName = entry.Entity.GetType().Name,
                    Action = entry.State.ToString(),
                    Timestamp = DateTime.UtcNow,
                    UserId = _currentUserService?.UserId
                };

                var changes = new Dictionary<string, object?>();
                foreach (var property in entry.Properties)
                {
                    if (property.IsModified || entry.State == EntityState.Added || entry.State == EntityState.Deleted)
                    {
                        changes[property.Metadata.Name] = property.CurrentValue;
                    }
                }
                auditLog.Changes = JsonSerializer.Serialize(changes);
                auditEntries.Add(auditLog);
            }

            if (auditEntries.Any())
            {
                AuditLogs.AddRange(auditEntries);
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
