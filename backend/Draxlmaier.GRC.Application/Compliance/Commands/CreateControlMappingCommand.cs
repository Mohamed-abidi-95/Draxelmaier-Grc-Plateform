using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Commands
{
    public class CreateControlMappingCommand : IRequest<Guid>
    {
        public Guid RequirementId { get; set; }
        public Guid? PolicyId { get; set; }
        public Guid? ControlId { get; set; }
        public string Status { get; set; } = "NotAssessed";
    }

    public class CreateControlMappingCommandHandler : IRequestHandler<CreateControlMappingCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateControlMappingCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateControlMappingCommand request, CancellationToken cancellationToken)
        {
            if (request.PolicyId == null && request.ControlId == null)
            {
                throw new ArgumentException("Either PolicyId or ControlId must be provided.");
            }

            Enum.TryParse<ComplianceStatus>(request.Status, true, out var status);

            var mapping = new ControlMapping
            {
                RequirementId = request.RequirementId,
                PolicyId = request.PolicyId,
                ControlId = request.ControlId,
                Status = status,
                Origin = MappingOrigin.Manual
            };

            _context.ControlMappings.Add(mapping);
            await _context.SaveChangesAsync(cancellationToken);

            return mapping.Id;
        }
    }
}
