using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Compliance.Commands
{
    public class DeleteEvidenceCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }

    public class DeleteEvidenceCommandHandler : IRequestHandler<DeleteEvidenceCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IFileStorage _fileStorage;

        public DeleteEvidenceCommandHandler(IApplicationDbContext context, IFileStorage fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        public async Task<bool> Handle(DeleteEvidenceCommand request, CancellationToken cancellationToken)
        {
            var evidence = await _context.Evidences
                .Include(e => e.Document)
                .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

            if (evidence == null)
            {
                return false;
            }

            // 1. Delete physical file from MinIO if Document exists
            if (evidence.Document != null)
            {
                try 
                {
                    await _fileStorage.DeleteAsync(evidence.Document.StorageKey, cancellationToken);
                }
                catch
                {
                    // Log error if needed, but continue with DB deletion
                }
                
                // 2. Remove Document entity
                _context.Documents.Remove(evidence.Document);
            }

            // 3. Remove Evidence entity
            _context.Evidences.Remove(evidence);
            
            // 4. Save Changes
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
