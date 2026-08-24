using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Compliance.Commands
{
    public class DeleteControlMappingCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class DeleteControlMappingCommandHandler : IRequestHandler<DeleteControlMappingCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteControlMappingCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteControlMappingCommand request, CancellationToken cancellationToken)
        {
            var mapping = await _context.ControlMappings.FindAsync(new object[] { request.Id }, cancellationToken);

            if (mapping == null)
            {
                return false;
            }

            _context.ControlMappings.Remove(mapping);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
