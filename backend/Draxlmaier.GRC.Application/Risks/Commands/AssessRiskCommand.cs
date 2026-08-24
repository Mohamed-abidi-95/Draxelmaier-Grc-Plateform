using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Risks.Commands;

public class AssessRiskCommand : IRequest<Guid>
{
    public Guid RiskId { get; set; }
    public int Probability { get; set; } // 1-5
    public int Impact { get; set; } // 1-5
    public Guid AssessorId { get; set; }
}

public class AssessRiskCommandHandler : IRequestHandler<AssessRiskCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public AssessRiskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AssessRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = await _context.Risks.FindAsync(new object[] { request.RiskId }, cancellationToken);
        if (risk == null)
        {
            throw new Exception("Risk not found."); // In a real app, use a custom NotFoundException
        }

        var assessment = new RiskAssessment
        {
            Id = Guid.NewGuid(),
            RiskId = request.RiskId,
            Probability = request.Probability,
            Impact = request.Impact,
            Score = request.Probability * request.Impact,
            AssessorId = request.AssessorId,
            AssessedAt = DateTime.UtcNow
        };

        _context.RiskAssessments.Add(assessment);
        await _context.SaveChangesAsync(cancellationToken);

        return assessment.Id;
    }
}
