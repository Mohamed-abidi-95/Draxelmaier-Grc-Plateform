using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;

namespace Draxlmaier.GRC.Application.Controls.Commands
{
    public class CreateControlCommand : IRequest<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid OrganizationId { get; set; }
    }

    public class CreateControlCommandHandler : IRequestHandler<CreateControlCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateControlCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateControlCommand request, CancellationToken cancellationToken)
        {
            var control = new Control
            {
                Name = request.Name,
                Description = request.Description,
                OrganizationId = request.OrganizationId
            };

            _context.Controls.Add(control);
            await _context.SaveChangesAsync(cancellationToken);

            return control.Id;
        }
    }
}
