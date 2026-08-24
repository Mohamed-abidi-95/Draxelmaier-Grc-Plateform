using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Policies.DTOs;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public class UploadDocumentCommandHandler : IRequestHandler<UploadDocumentCommand, DocumentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorage _fileStorage;
    private readonly ICurrentUserService _currentUserService;

    public UploadDocumentCommandHandler(IApplicationDbContext context, IFileStorage fileStorage, ICurrentUserService currentUserService)
    {
        _context = context;
        _fileStorage = fileStorage;
        _currentUserService = currentUserService;
    }

    public async Task<DocumentDto> Handle(UploadDocumentCommand request, CancellationToken cancellationToken)
    {
        var docId = Guid.NewGuid();
        var storageKey = $"tenant/{request.OrganizationId}/documents/{docId}/{request.Filename}";
        var userId = _currentUserService.UserId?.ToString() ?? string.Empty;

        // Compute hash and size
        string hashStr;
        long size;
        
        using (var sha256 = SHA256.Create())
        {
            var hash = await sha256.ComputeHashAsync(request.Content, cancellationToken);
            hashStr = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
            size = request.Content.Length;
            
            // Reset position for upload
            request.Content.Position = 0;
        }

        // Upload to storage
        await _fileStorage.UploadAsync(storageKey, request.Content, request.ContentType, cancellationToken);

        // Save metadata
        var document = new Document
        {
            Id = docId,
            OrganizationId = request.OrganizationId,
            StorageKey = storageKey,
            OriginalFilename = request.Filename,
            MimeType = request.ContentType,
            FileSize = size,
            HashSha256 = hashStr,
            UploadedBy = userId,
            UploadedAt = DateTime.UtcNow
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        return new DocumentDto
        {
            Id = document.Id,
            OriginalFilename = document.OriginalFilename,
            MimeType = document.MimeType,
            FileSize = document.FileSize,
            HashSha256 = document.HashSha256,
            UploadedAt = document.UploadedAt,
            UploadedBy = document.UploadedBy
        };
    }
}
