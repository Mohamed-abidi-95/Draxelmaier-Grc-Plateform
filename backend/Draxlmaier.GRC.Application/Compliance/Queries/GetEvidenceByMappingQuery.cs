using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Compliance.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Compliance.Queries
{
    public class GetEvidenceByMappingQuery : IRequest<List<EvidenceDto>>
    {
        public Guid MappingId { get; set; }
    }

    public class GetEvidenceByMappingQueryHandler : IRequestHandler<GetEvidenceByMappingQuery, List<EvidenceDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetEvidenceByMappingQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EvidenceDto>> Handle(GetEvidenceByMappingQuery request, CancellationToken cancellationToken)
        {
            return await _context.Evidences
                .Include(e => e.Document)
                .Where(e => e.ControlMappingId == request.MappingId)
                .OrderByDescending(e => e.UploadedAt)
                .Select(e => new EvidenceDto
                {
                    Id = e.Id,
                    ControlMappingId = e.ControlMappingId,
                    DocumentId = e.DocumentId,
                    Description = e.Description,
                    OriginalFilename = e.Document != null ? e.Document.OriginalFilename : "",
                    FileSize = e.Document != null ? e.Document.FileSize : 0,
                    UploadedAt = e.UploadedAt,
                    UploadedBy = e.UploadedBy
                })
                .ToListAsync(cancellationToken);
        }
    }
}
