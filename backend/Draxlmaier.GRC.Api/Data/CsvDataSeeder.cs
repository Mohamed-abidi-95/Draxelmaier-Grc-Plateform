using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using Draxlmaier.GRC.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Draxlmaier.GRC.Api.Data
{
    public static class CsvDataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, ILogger logger, string datasetsPath)
        {
            if (!Directory.Exists(datasetsPath))
            {
                logger.LogWarning($"Datasets path not found: {datasetsPath}");
                return;
            }

            var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                HeaderValidated = null,
                IgnoreBlankLines = true
            };

            // 1. Organizations
            if (!await context.Organizations.AnyAsync())
            {
                var orgFile = Path.Combine(datasetsPath, "01_organizations.csv");
                if (File.Exists(orgFile))
                {
                    using var reader = new StreamReader(orgFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<Organization>().ToList();
                    context.Organizations.AddRange(records);
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} organizations.");
                }
            }

            // 2. Policies
            if (!await context.Policies.AnyAsync())
            {
                var policyFile = Path.Combine(datasetsPath, "02_policies.csv");
                if (File.Exists(policyFile))
                {
                    using var reader = new StreamReader(policyFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<dynamic>().ToList();
                    foreach (var rec in records)
                    {
                        context.Policies.Add(new Policy
                        {
                            Id = Guid.Parse(rec.Id),
                            Title = rec.Title,
                            OrganizationId = Guid.Parse(rec.OrganizationId),
                            OwnerId = rec.OwnerId,
                            ExpiryDate = DateTime.Parse(rec.ExpirationDate),
                            CreatedAt = DateTime.Parse(rec.CreatedAt),
                            Status = Enum.Parse<PolicyStatus>("Active")
                        });
                    }
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} policies.");
                }
            }

            // 3. Risks
            if (!await context.Risks.AnyAsync())
            {
                var riskFile = Path.Combine(datasetsPath, "03_risks.csv");
                if (!File.Exists(riskFile)) riskFile = Path.Combine(datasetsPath, "02_risks.csv"); // fallback

                if (File.Exists(riskFile))
                {
                    using var reader = new StreamReader(riskFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<dynamic>().ToList();
                    foreach (var rec in records)
                    {
                        context.Risks.Add(new Risk
                        {
                            Id = Guid.Parse(rec.Id),
                            Title = rec.Title,
                            Description = rec.Description,
                            OrganizationId = Guid.Parse(rec.OrganizationId),
                            OwnerId = rec.OwnerId,
                            Status = Enum.Parse<RiskStatus>(rec.Status),
                            CreatedAt = DateTime.Parse(rec.CreatedAt)
                        });
                    }
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} risks.");
                }
            }

            // 4. Risk Assessments
            if (!await context.RiskAssessments.AnyAsync())
            {
                var assessFile = Path.Combine(datasetsPath, "04_risk_assessments.csv");
                if (!File.Exists(assessFile)) assessFile = Path.Combine(datasetsPath, "03_risk_assessments.csv"); // fallback

                if (File.Exists(assessFile))
                {
                    using var reader = new StreamReader(assessFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<dynamic>().ToList();
                    foreach (var rec in records)
                    {
                        context.RiskAssessments.Add(new RiskAssessment
                        {
                            Id = Guid.Parse(rec.Id),
                            RiskId = Guid.Parse(rec.RiskId),
                            Probability = int.Parse(rec.Probability),
                            Impact = int.Parse(rec.Impact),
                            Score = int.Parse(rec.Score),
                            AssessorId = rec.AssessorId,
                            AssessedAt = DateTime.Parse(rec.AssessedAt)
                        });
                    }
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} risk assessments.");
                }
            }

            // 5. Frameworks
            if (!await context.ComplianceFrameworks.AnyAsync())
            {
                var frameworkFile = Path.Combine(datasetsPath, "05_compliance_frameworks.csv");
                if (File.Exists(frameworkFile))
                {
                    using var reader = new StreamReader(frameworkFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<ComplianceFramework>().ToList();
                    context.ComplianceFrameworks.AddRange(records);
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} compliance frameworks.");
                }
            }

            // 6. Requirements
            if (!await context.ComplianceRequirements.AnyAsync())
            {
                var reqFile = Path.Combine(datasetsPath, "06_compliance_requirements.csv");
                if (File.Exists(reqFile))
                {
                    using var reader = new StreamReader(reqFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<dynamic>().ToList();
                    foreach (var rec in records)
                    {
                        context.ComplianceRequirements.Add(new ComplianceRequirement
                        {
                            Id = Guid.Parse(rec.Id),
                            FrameworkId = Guid.Parse(rec.FrameworkId),
                            Identifier = rec.Code, // Mapping Code -> Identifier
                            Title = rec.Title,
                            Description = rec.Description
                        });
                    }
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} compliance requirements.");
                }
            }

            // 7. Controls
            if (!await context.Controls.AnyAsync())
            {
                var ctrlFile = Path.Combine(datasetsPath, "07_controls.csv");
                if (File.Exists(ctrlFile))
                {
                    using var reader = new StreamReader(ctrlFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<Control>().ToList();
                    context.Controls.AddRange(records);
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} controls.");
                }
            }

            // 8. Control Mappings
            if (!await context.ControlMappings.AnyAsync())
            {
                var mappingFile = Path.Combine(datasetsPath, "08_control_mappings.csv");
                if (File.Exists(mappingFile))
                {
                    using var reader = new StreamReader(mappingFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<dynamic>().ToList();
                    foreach (var rec in records)
                    {
                        context.ControlMappings.Add(new ControlMapping
                        {
                            Id = Guid.Parse(rec.Id),
                            RequirementId = Guid.Parse(rec.RequirementId),
                            ControlId = string.IsNullOrEmpty(rec.ControlId) ? null : Guid.Parse(rec.ControlId),
                            PolicyId = string.IsNullOrEmpty(rec.PolicyId) ? null : Guid.Parse(rec.PolicyId),
                            Status = Enum.Parse<ComplianceStatus>(rec.Status),
                            Origin = MappingOrigin.Manual,
                            CreatedAt = DateTime.Parse(rec.CreatedAt)
                        });
                    }
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} control mappings.");
                }
            }

            // 9. Evidences
            if (!await context.Evidences.AnyAsync())
            {
                var evidenceFile = Path.Combine(datasetsPath, "09_evidence.csv");
                if (File.Exists(evidenceFile))
                {
                    using var reader = new StreamReader(evidenceFile);
                    using var csv = new CsvReader(reader, csvConfig);
                    var records = csv.GetRecords<dynamic>().ToList();
                    foreach (var rec in records)
                    {
                        // We need to mock a Document entity for each evidence
                        var docId = Guid.NewGuid();
                        context.Documents.Add(new Document
                        {
                            Id = docId,
                            OriginalFilename = rec.FileName,
                            StorageKey = $"mock/{rec.FileName}",
                            MimeType = "application/pdf",
                            FileSize = 1024,
                            OrganizationId = context.Organizations.First().Id,
                            UploadedBy = rec.UploadedBy,
                            UploadedAt = DateTime.Parse(rec.UploadedAt)
                        });

                        context.Evidences.Add(new Evidence
                        {
                            Id = Guid.Parse(rec.Id),
                            ControlMappingId = Guid.Parse(rec.ControlMappingId),
                            DocumentId = docId,
                            Description = rec.Description,
                            UploadedAt = DateTime.Parse(rec.UploadedAt),
                            UploadedBy = rec.UploadedBy
                        });
                    }
                    await context.SaveChangesAsync();
                    logger.LogInformation($"Seeded {records.Count} evidences.");
                }
            }
        }
    }
}
