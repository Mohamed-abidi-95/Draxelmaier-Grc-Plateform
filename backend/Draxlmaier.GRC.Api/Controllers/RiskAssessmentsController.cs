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
[Route("api/v1/risk-assessments")]
[Authorize]
public class RiskAssessmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RiskAssessmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,RiskOwner,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<RiskAssessmentDto>>> GetRiskAssessments([FromQuery] Guid? riskId)
    {
        var assessments = await _mediator.Send(new GetRiskAssessmentsQuery { RiskId = riskId });
        return Ok(assessments);
    }
}
