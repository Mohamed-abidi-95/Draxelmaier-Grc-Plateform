using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Findings.Commands;
using Draxlmaier.GRC.Application.Findings.DTOs;
using Draxlmaier.GRC.Application.Findings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class FindingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FindingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult<Guid>> CreateFinding([FromBody] CreateFindingCommand command)
    {
        var findingId = await _mediator.Send(command);
        return Ok(findingId);
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<FindingDto>>> GetOpenFindings()
    {
        var findings = await _mediator.Send(new GetOpenFindingsQuery());
        return Ok(findings);
    }

    [HttpGet("audit/{auditId}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<FindingDto>>> GetFindingsByAudit(Guid auditId)
    {
        var findings = await _mediator.Send(new GetFindingsByAuditQuery { AuditId = auditId });
        return Ok(findings);
    }
}
