using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Compliance.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Queries
{
    public class GetRequirementsQuery : IRequest<List<ComplianceRequirementDto>>
    {
        public Guid FrameworkId { get; set; }
    }

    public class GetRequirementsQueryHandler : IRequestHandler<GetRequirementsQuery, List<ComplianceRequirementDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetRequirementsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ComplianceRequirementDto>> Handle(GetRequirementsQuery request, CancellationToken cancellationToken)
        {
            var requirements = await _context.ComplianceRequirements
                .Where(r => r.FrameworkId == request.FrameworkId)
                .Include(r => r.ControlMappings)
                .Select(r => new ComplianceRequirementDto
                {
                    Id = r.Id,
                    FrameworkId = r.FrameworkId,
                    Identifier = r.Identifier,
                    Title = r.Title,
                    Description = r.Description,
                    Status = r.ControlMappings.Any() 
                             ? r.ControlMappings.OrderByDescending(m => m.CreatedAt).First().Status.ToString() 
                             : "NotAssessed"
                })
                .ToListAsync(cancellationToken);

            // Sorting by identifier is tricky if it's string (e.g. "5.1" vs "10.1") but we'll do simple order here
            return requirements.OrderBy(r => r.Identifier).ToList();
        }
    }
}
