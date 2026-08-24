using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Risks.Commands;

public class CreateRiskCommand : IRequest<Guid>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid OwnerId { get; set; }
}

public class CreateRiskCommandHandler : IRequestHandler<CreateRiskCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateRiskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateRiskCommand request, CancellationToken cancellationToken)
    {
        var risk = new Risk
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Code = request.Code,
            Category = request.Category,
            OrganizationId = request.OrganizationId,
            OwnerId = request.OwnerId,
            Status = RiskStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _context.Risks.Add(risk);
        await _context.SaveChangesAsync(cancellationToken);

        // Normally we would also log to AuditTrail here

        return risk.Id;
    }
}
