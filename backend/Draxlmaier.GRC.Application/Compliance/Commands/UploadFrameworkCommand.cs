using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;

namespace Draxlmaier.GRC.Application.Compliance.Commands
{
    public class UploadFrameworkCommand : IRequest<Guid>
    {
        public string FrameworkName { get; set; } = string.Empty;
        public string FrameworkVersion { get; set; } = string.Empty;
        public string Filename { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public Stream Content { get; set; } = Stream.Null;
        public Guid OrganizationId { get; set; }
    }

    public class UploadFrameworkCommandHandler : IRequestHandler<UploadFrameworkCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IFileStorage _fileStorage;
        private readonly ICurrentUserService _currentUserService;

        public UploadFrameworkCommandHandler(
            IApplicationDbContext context, 
            IFileStorage fileStorage, 
            ICurrentUserService currentUserService)
        {
            _context = context;
            _fileStorage = fileStorage;
            _currentUserService = currentUserService;
        }

        public async Task<Guid> Handle(UploadFrameworkCommand request, CancellationToken cancellationToken)
        {
            // 1. Prepare Document Storage
            var docId = Guid.NewGuid();
            var storageKey = $"tenant/{request.OrganizationId}/frameworks/{docId}/{request.Filename}";
            var userId = _currentUserService.UserId?.ToString() ?? string.Empty;

            // Optional: compute hash here if needed, keeping it simple for now
            long size = request.Content.Length;

            // 2. Upload to storage
            await _fileStorage.UploadAsync(storageKey, request.Content, request.ContentType, cancellationToken);

            // 3. Create Document Entity
            var document = new Document
            {
                Id = docId,
                OrganizationId = request.OrganizationId,
                StorageKey = storageKey,
                OriginalFilename = request.Filename,
                MimeType = request.ContentType,
                FileSize = size,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);

            // 4. Create Framework Entity linked to the Document
            var framework = new ComplianceFramework
            {
                Id = Guid.NewGuid(),
                Name = request.FrameworkName,
                Version = request.FrameworkVersion,
                Description = $"Imported file on {DateTime.UtcNow:yyyy-MM-dd}",
                DocumentId = docId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ComplianceFrameworks.Add(framework);

            // 5. Save all
            await _context.SaveChangesAsync(cancellationToken);

            return framework.Id;
        }
    }
}
