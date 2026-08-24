using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Audits.Commands;

public class CreateAuditCommand : IRequest<Guid>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid AuditorId { get; set; }
    public Guid? TargetFrameworkId { get; set; }
    public DateTime? PlannedDate { get; set; }
}

public class CreateAuditCommandHandler : IRequestHandler<CreateAuditCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateAuditCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAuditCommand request, CancellationToken cancellationToken)
    {
        var audit = new Audit
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OrganizationId = request.OrganizationId,
            AuditorId = request.AuditorId,
            TargetFrameworkId = request.TargetFrameworkId,
            PlannedDate = request.PlannedDate,
            Status = AuditStatus.Planned,
            Result = AuditResult.NotAssessed
        };

        _context.Audits.Add(audit);
        await _context.SaveChangesAsync(cancellationToken);

        return audit.Id;
    }
}
