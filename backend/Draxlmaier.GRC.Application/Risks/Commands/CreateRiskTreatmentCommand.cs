using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Risks.Commands;

public class CreateRiskTreatmentCommand : IRequest<Guid>
{
    public Guid RiskId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
}

public class CreateRiskTreatmentCommandHandler : IRequestHandler<CreateRiskTreatmentCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateRiskTreatmentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateRiskTreatmentCommand request, CancellationToken cancellationToken)
    {
        var risk = await _context.Risks.FindAsync(new object[] { request.RiskId }, cancellationToken);
        if (risk == null)
        {
            throw new Exception("Risk not found");
        }

        if (!Enum.TryParse<RiskTreatmentType>(request.Type, true, out var treatmentType))
        {
            throw new Exception("Invalid treatment type");
        }

        var treatment = new RiskTreatment
        {
            Id = Guid.NewGuid(),
            RiskId = request.RiskId,
            Type = treatmentType,
            Description = request.Description,
            DueDate = request.DueDate
        };

        _context.RiskTreatments.Add(treatment);
        await _context.SaveChangesAsync(cancellationToken);

        return treatment.Id;
    }
}
