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
[Route("api/v1/risk-treatments")]
[Authorize]
public class RiskTreatmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RiskTreatmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,RiskOwner,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<RiskTreatmentDto>>> GetRiskTreatments([FromQuery] Guid? riskId)
    {
        var treatments = await _mediator.Send(new GetRiskTreatmentsQuery { RiskId = riskId });
        return Ok(treatments);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,RiskOwner")]
    public async Task<ActionResult<Guid>> CreateRiskTreatment([FromBody] CreateRiskTreatmentCommand command)
    {
        try
        {
            var treatmentId = await _mediator.Send(command);
            return Ok(treatmentId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
