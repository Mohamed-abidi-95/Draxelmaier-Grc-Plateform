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
    [Authorize]
    public class FrameworksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FrameworksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Guid>> UploadFramework(
            [FromForm] Guid organizationId,
            [FromForm] string name,
            [FromForm] string version,
            IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            using var stream = new System.IO.MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            var command = new UploadFrameworkCommand
            {
                OrganizationId = organizationId,
                FrameworkName = name,
                FrameworkVersion = version,
                Filename = file.FileName,
                ContentType = file.ContentType,
                Content = stream
            };

            var frameworkId = await _mediator.Send(command);
            return Ok(new { frameworkId });
        }

        [HttpGet]
        public async Task<ActionResult<List<ComplianceFrameworkDto>>> GetFrameworks()
        {
            var frameworks = await _mediator.Send(new GetFrameworksQuery());
            return Ok(frameworks);
        }

        [HttpGet("{id}/requirements")]
        public async Task<ActionResult<List<ComplianceRequirementDto>>> GetRequirements(Guid id)
        {
            var requirements = await _mediator.Send(new GetRequirementsQuery { FrameworkId = id });
            return Ok(requirements);
        }

        [HttpGet("{id}/status")]
        public async Task<ActionResult<ComplianceStatusDto>> GetFrameworkStatus(Guid id)
        {
            var status = await _mediator.Send(new GetComplianceStatusQuery { FrameworkId = id });
            if (status == null) return NotFound();
            return Ok(status);
        }

        [HttpGet("{id}/soa")]
        public async Task<ActionResult<List<SoAReportItemDto>>> GetSoAReport(Guid id)
        {
            var report = await _mediator.Send(new GetSoAReportQuery(id));
            return Ok(report);
        }
    }
}
