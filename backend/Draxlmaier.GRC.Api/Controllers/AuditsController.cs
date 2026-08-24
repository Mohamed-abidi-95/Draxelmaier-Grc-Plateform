using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Audits.Commands;
using Draxlmaier.GRC.Application.Audits.DTOs;
using Draxlmaier.GRC.Application.Audits.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AuditsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<AuditDto>>> GetAudits()
    {
        var audits = await _mediator.Send(new GetAuditsQuery());
        return Ok(audits);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<AuditDto>> GetAuditById(Guid id)
    {
        var audit = await _mediator.Send(new GetAuditByIdQuery { Id = id });
        if (audit == null) return NotFound();
        return Ok(audit);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    public async Task<ActionResult<Guid>> CreateAudit([FromBody] CreateAuditCommand command)
    {
        var auditId = await _mediator.Send(command);
        return Ok(new { auditId });
    }

    [HttpPatch("{id}/result")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    public async Task<ActionResult> UpdateAuditResult(Guid id, [FromBody] UpdateAuditResultCommand command)
    {
        if (id != command.AuditId)
            return BadRequest("Audit ID mismatch");

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
