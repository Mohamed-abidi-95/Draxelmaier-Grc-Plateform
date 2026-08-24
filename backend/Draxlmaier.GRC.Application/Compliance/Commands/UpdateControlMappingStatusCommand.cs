using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Commands
{
    public class UpdateControlMappingStatusCommand : IRequest<bool>
    {
        public Guid MappingId { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateControlMappingStatusCommandHandler : IRequestHandler<UpdateControlMappingStatusCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateControlMappingStatusCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateControlMappingStatusCommand request, CancellationToken cancellationToken)
        {
            var mapping = await _context.ControlMappings
                .FirstOrDefaultAsync(m => m.Id == request.MappingId, cancellationToken);

            if (mapping == null)
            {
                return false;
            }

            if (Enum.TryParse<ComplianceStatus>(request.Status, true, out var newStatus))
            {
                mapping.Status = newStatus;
                await _context.SaveChangesAsync(cancellationToken);
                return true;
            }
            
            throw new ArgumentException($"Invalid ComplianceStatus value: {request.Status}");
        }
    }
}
