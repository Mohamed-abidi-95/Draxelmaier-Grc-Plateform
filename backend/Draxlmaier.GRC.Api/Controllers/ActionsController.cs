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
public class ActionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ActionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,ComplianceOfficer,Auditor")]
    public async Task<ActionResult<Guid>> CreateCorrectiveAction([FromBody] CreateCorrectiveActionCommand command)
    {
        var actionId = await _mediator.Send(command);
        return Ok(actionId);
    }

    [HttpGet("finding/{findingId}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<CorrectiveActionDto>>> GetActionsByFinding(Guid findingId)
    {
        var actions = await _mediator.Send(new GetCorrectiveActionsByFindingQuery { FindingId = findingId });
        return Ok(actions);
    }
}
