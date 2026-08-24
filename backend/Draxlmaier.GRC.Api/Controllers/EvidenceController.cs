using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Compliance.Commands;
using Draxlmaier.GRC.Application.Compliance.DTOs;
using Draxlmaier.GRC.Application.Compliance.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class EvidenceController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EvidenceController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize(Roles = "ComplianceOfficer,Administrator")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Guid>> UploadEvidence(
            [FromForm] Guid mappingId,
            [FromForm] Guid organizationId,
            [FromForm] string? description,
            IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            var uploadedBy = User.Identity?.Name ?? "system";

            using var stream = file.OpenReadStream();
            var command = new UploadEvidenceCommand
            {
                ControlMappingId = mappingId,
                OrganizationId = organizationId,
                Description = description ?? "",
                FileStream = stream,
                OriginalFilename = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                UploadedBy = uploadedBy
            };

            var evidenceId = await _mediator.Send(command);
            return Ok(new { evidenceId });
        }

        [HttpGet("mapping/{mappingId}")]
        [Authorize(Roles = "ComplianceOfficer,Administrator,PolicyOwner")]
        public async Task<ActionResult<List<EvidenceDto>>> GetEvidenceByMapping(Guid mappingId)
        {
            var evidences = await _mediator.Send(new GetEvidenceByMappingQuery { MappingId = mappingId });
            return Ok(evidences);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ComplianceOfficer,Administrator")]
        public async Task<ActionResult> DeleteEvidence(Guid id)
        {
            var result = await _mediator.Send(new DeleteEvidenceCommand { Id = id });
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
