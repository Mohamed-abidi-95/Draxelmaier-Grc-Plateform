using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Controls.Commands
{
    public class DeleteControlCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class DeleteControlCommandHandler : IRequestHandler<DeleteControlCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteControlCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteControlCommand request, CancellationToken cancellationToken)
        {
            var control = await _context.Controls.FindAsync(new object[] { request.Id }, cancellationToken);

            if (control == null)
            {
                return false;
            }

            _context.Controls.Remove(control);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
