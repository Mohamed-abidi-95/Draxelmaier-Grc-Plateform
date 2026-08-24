using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Controls.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Controls.Queries
{
    public class GetControlByIdQuery : IRequest<ControlDto?>
    {
        public Guid Id { get; set; }
    }

    public class GetControlByIdQueryHandler : IRequestHandler<GetControlByIdQuery, ControlDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetControlByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ControlDto?> Handle(GetControlByIdQuery request, CancellationToken cancellationToken)
        {
            var control = await _context.Controls
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            if (control == null)
            {
                return null;
            }

            return new ControlDto
            {
                Id = control.Id,
                Name = control.Name,
                Description = control.Description,
                OrganizationId = control.OrganizationId,
                CreatedAt = control.CreatedAt
            };
        }
    }
}
