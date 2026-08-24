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
    public class GetFrameworksQuery : IRequest<List<ComplianceFrameworkDto>>
    {
    }

    public class GetFrameworksQueryHandler : IRequestHandler<GetFrameworksQuery, List<ComplianceFrameworkDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetFrameworksQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ComplianceFrameworkDto>> Handle(GetFrameworksQuery request, CancellationToken cancellationToken)
        {
            var frameworks = await _context.ComplianceFrameworks
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new ComplianceFrameworkDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Version = f.Version,
                    Description = f.Description,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return frameworks;
        }
    }
}
