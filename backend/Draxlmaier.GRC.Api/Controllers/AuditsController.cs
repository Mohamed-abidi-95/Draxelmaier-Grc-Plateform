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

    [HttpGet("{id}/findings")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<FindingDto>>> GetFindingsByAuditId(Guid id)
    {
        var findings = await _mediator.Send(new GetFindingsByAuditIdQuery(id));
        return Ok(findings);
    }

    [HttpPost("{id}/findings")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult<Guid>> CreateFinding(Guid id, [FromBody] CreateFindingCommand command)
    {
        if (id != command.AuditId)
            return BadRequest("Audit ID mismatch");

        var findingId = await _mediator.Send(command);
        return Ok(new { findingId });
    }

    [HttpPatch("findings/{findingId}/status")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult> UpdateFindingStatus(Guid findingId, [FromBody] UpdateFindingStatusCommand command)
    {
        if (findingId != command.FindingId)
            return BadRequest("Finding ID mismatch");

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("findings/{findingId}/actions")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<CorrectiveActionDto>>> GetCorrectiveActions(Guid findingId)
    {
        var actions = await _mediator.Send(new GetCorrectiveActionsByFindingIdQuery(findingId));
        return Ok(actions);
    }

    [HttpPost("findings/{findingId}/actions")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult<Guid>> CreateCorrectiveAction(Guid findingId, [FromBody] CreateCorrectiveActionCommand command)
    {
        if (findingId != command.FindingId)
            return BadRequest("Finding ID mismatch");

        var actionId = await _mediator.Send(command);
        return Ok(new { actionId });
    }

    [HttpPatch("findings/actions/{actionId}/status")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult> UpdateCorrectiveActionStatus(Guid actionId, [FromBody] UpdateCorrectiveActionStatusCommand command)
    {
        if (actionId != command.ActionId)
            return BadRequest("Action ID mismatch");

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}/checklist")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<AuditItemDto>>> GetAuditChecklist(Guid id)
    {
        var checklist = await _mediator.Send(new GetAuditChecklistQuery(id));
        return Ok(checklist);
    }

    [HttpPost("{id}/checklist")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult<Guid>> AddAuditItem(Guid id, [FromBody] AddAuditItemCommand command)
    {
        if (id != command.AuditId)
            return BadRequest("Audit ID mismatch");

        var itemId = await _mediator.Send(command);
        return Ok(new { itemId });
    }

    [HttpPatch("checklist/{itemId}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult> EvaluateAuditItem(Guid itemId, [FromBody] EvaluateAuditItemCommand command)
    {
        if (itemId != command.Id)
            return BadRequest("Item ID mismatch");

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("checklist/{itemId}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult> DeleteAuditItem(Guid itemId)
    {
        var success = await _mediator.Send(new DeleteAuditItemCommand(itemId));
        if (!success)
            return NotFound();

        return NoContent();
    }
}
