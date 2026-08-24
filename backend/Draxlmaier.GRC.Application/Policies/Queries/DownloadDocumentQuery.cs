using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Policies.Queries;

public record DownloadDocumentResult(Stream Content, string ContentType, string Filename);

public record DownloadDocumentQuery(Guid Id) : IRequest<DownloadDocumentResult?>;

public class DownloadDocumentQueryHandler : IRequestHandler<DownloadDocumentQuery, DownloadDocumentResult?>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorage _fileStorage;

    public DownloadDocumentQueryHandler(IApplicationDbContext context, IFileStorage fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task<DownloadDocumentResult?> Handle(DownloadDocumentQuery request, CancellationToken cancellationToken)
    {
        var document = await _context.Documents
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (document == null) return null;

        var stream = await _fileStorage.DownloadAsync(document.StorageKey, cancellationToken);
        
        return new DownloadDocumentResult(stream, document.MimeType, document.OriginalFilename);
    }
}
