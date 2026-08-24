using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Controls.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Controls.Queries
{
    public class GetControlsQuery : IRequest<List<ControlDto>>
    {
        public Guid OrganizationId { get; set; }
    }

    public class GetControlsQueryHandler : IRequestHandler<GetControlsQuery, List<ControlDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetControlsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ControlDto>> Handle(GetControlsQuery request, CancellationToken cancellationToken)
        {
            return await _context.Controls
                .Where(c => c.OrganizationId == request.OrganizationId)
                .Select(c => new ControlDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    OrganizationId = c.OrganizationId,
                    CreatedAt = c.CreatedAt
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(cancellationToken);
        }
    }
}
