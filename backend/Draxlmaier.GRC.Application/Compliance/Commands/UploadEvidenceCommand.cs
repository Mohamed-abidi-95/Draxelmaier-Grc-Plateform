using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Commands
{
    public class UploadEvidenceCommand : IRequest<Guid>
    {
        public Guid ControlMappingId { get; set; }
        public Guid OrganizationId { get; set; }
        public string Description { get; set; } = string.Empty;
        
        public Stream FileStream { get; set; } = Stream.Null;
        public string OriginalFilename { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        
        public string UploadedBy { get; set; } = string.Empty;
    }

    public class UploadEvidenceCommandHandler : IRequestHandler<UploadEvidenceCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IFileStorage _fileStorage;

        public UploadEvidenceCommandHandler(IApplicationDbContext context, IFileStorage fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        public async Task<Guid> Handle(UploadEvidenceCommand request, CancellationToken cancellationToken)
        {
            var mapping = await _context.ControlMappings
                .FirstOrDefaultAsync(m => m.Id == request.ControlMappingId, cancellationToken);

            if (mapping == null)
            {
                throw new ArgumentException("ControlMapping not found");
            }

            // 1. Create Document Entity
            var documentId = Guid.NewGuid();
            var storageKey = $"tenant/{request.OrganizationId}/evidence/{documentId}/{request.OriginalFilename}";

            var document = new Document
            {
                Id = documentId,
                OrganizationId = request.OrganizationId,
                StorageKey = storageKey,
                OriginalFilename = request.OriginalFilename,
                MimeType = request.ContentType,
                FileSize = request.FileSize,
                UploadedAt = DateTime.UtcNow,
                UploadedBy = request.UploadedBy
            };

            _context.Documents.Add(document);

            // 2. Upload physical file to MinIO via IFileStorage
            await _fileStorage.UploadAsync(storageKey, request.FileStream, request.ContentType, cancellationToken);

            // 3. Create Evidence Entity
            var evidence = new Evidence
            {
                ControlMappingId = request.ControlMappingId,
                DocumentId = documentId,
                Description = request.Description,
                UploadedAt = DateTime.UtcNow,
                UploadedBy = request.UploadedBy
            };

            _context.Evidences.Add(evidence);

            // 4. Save Changes
            await _context.SaveChangesAsync(cancellationToken);

            return evidence.Id;
        }
    }
}
