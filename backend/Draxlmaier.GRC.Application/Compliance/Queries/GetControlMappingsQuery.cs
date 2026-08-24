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
    public class GetControlMappingsQuery : IRequest<List<ControlMappingDto>>
    {
        public Guid? RequirementId { get; set; }
    }

    public class GetControlMappingsQueryHandler : IRequestHandler<GetControlMappingsQuery, List<ControlMappingDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetControlMappingsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ControlMappingDto>> Handle(GetControlMappingsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.ControlMappings.AsQueryable();

            if (request.RequirementId.HasValue)
            {
                query = query.Where(m => m.RequirementId == request.RequirementId.Value);
            }

            var mappings = await query
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ControlMappingDto
                {
                    Id = m.Id,
                    RequirementId = m.RequirementId,
                    PolicyId = m.PolicyId,
                    ControlId = m.ControlId,
                    Status = m.Status.ToString(),
                    Origin = m.Origin.ToString(),
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return mappings;
        }
    }
}
