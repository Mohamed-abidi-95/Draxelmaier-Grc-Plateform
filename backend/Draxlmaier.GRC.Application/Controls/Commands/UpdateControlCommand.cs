using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Controls.Commands
{
    public class UpdateControlCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateControlCommandHandler : IRequestHandler<UpdateControlCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public UpdateControlCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateControlCommand request, CancellationToken cancellationToken)
        {
            var control = await _context.Controls.FindAsync(new object[] { request.Id }, cancellationToken);

            if (control == null)
            {
                return false;
            }

            control.Name = request.Name;
            control.Description = request.Description;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
