using Draxlmaier.GRC.Application.Risks.Commands;
using Draxlmaier.GRC.Application.Risks.DTOs;
using Draxlmaier.GRC.Application.Risks.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // Requires authentication
public class RisksController : ControllerBase
{
    private readonly IMediator _mediator;

    public RisksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,RiskOwner")]
    public async Task<ActionResult<Guid>> CreateRisk([FromBody] CreateRiskCommand command)
    {
        var riskId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetRiskById), new { id = riskId }, riskId);
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,RiskOwner,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<RiskDto>>> GetRisks()
    {
        var risks = await _mediator.Send(new GetRisksQuery());
        return Ok(risks);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Administrator,RiskOwner,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<RiskDto>> GetRiskById(Guid id)
    {
        var risk = await _mediator.Send(new GetRiskByIdQuery { Id = id });
        
        if (risk == null)
        {
            return NotFound();
        }

        return Ok(risk);
    }

    [HttpPost("{id}/assessments")]
    [Authorize(Roles = "Administrator,RiskOwner")]
    public async Task<ActionResult<Guid>> AssessRisk(Guid id, [FromBody] AssessRiskCommand command)
    {
        if (id != command.RiskId)
        {
            return BadRequest("Risk ID mismatch.");
        }

        try
        {
            var assessmentId = await _mediator.Send(command);
            return Ok(assessmentId);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message); // Simplification for demo
        }
    }

    [HttpPut("{id}/asset")]
    [Authorize(Roles = "Administrator,RiskOwner")]
    public async Task<ActionResult> LinkAsset(Guid id, [FromBody] LinkAssetToRiskCommand command)
    {
        if (id != command.RiskId) return BadRequest("Risk ID mismatch.");
        
        var result = await _mediator.Send(command);
        if (!result) return NotFound("Risk or Asset not found.");
        
        return NoContent();
    }

    [HttpPost("{id}/controls")]
    [Authorize(Roles = "Administrator,RiskOwner")]
    public async Task<ActionResult> LinkControl(Guid id, [FromBody] LinkControlToRiskCommand command)
    {
        if (id != command.RiskId) return BadRequest("Risk ID mismatch.");
        
        var result = await _mediator.Send(command);
        if (!result) return NotFound("Risk or Control not found.");
        
        return NoContent();
    }
}
