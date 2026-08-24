using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public record DeleteDocumentCommand(Guid Id) : IRequest<bool>;

public class DeleteDocumentCommandHandler : IRequestHandler<DeleteDocumentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorage _fileStorage;

    public DeleteDocumentCommandHandler(IApplicationDbContext context, IFileStorage fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task<bool> Handle(DeleteDocumentCommand request, CancellationToken cancellationToken)
    {
        var document = await _context.Documents.FindAsync(new object[] { request.Id }, cancellationToken);
        
        if (document == null) return false;

        // Try to delete from storage. In production, consider a background job for reliable cleanup.
        try
        {
            await _fileStorage.DeleteAsync(document.StorageKey, cancellationToken);
        }
        catch 
        {
            // If storage deletion fails, we might still want to delete DB record or log it.
            // For MVP, we proceed to delete the record.
        }

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
