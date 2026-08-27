using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Policies.Commands;
using Draxlmaier.GRC.Application.Policies.DTOs;
using Draxlmaier.GRC.Application.Policies.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PoliciesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PoliciesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    public async Task<ActionResult<Guid>> CreatePolicy([FromBody] CreatePolicyCommand command)
    {
        // Typically, we would get the OrganizationId and OwnerId from the authenticated user's claims.
        // For MVP, we can assume it's passed in the command or extracted here.
        var policyId = await _mediator.Send(command);
        return Ok(policyId);
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,ComplianceOfficer,PolicyOwner,CISO,Auditor,PolicyApprover,EndUser")]
    public async Task<ActionResult<List<PolicyDto>>> GetPolicies([FromQuery] Guid organizationId)
    {
        var query = new GetPoliciesQuery { OrganizationId = organizationId };
        var policies = await _mediator.Send(query);
        return Ok(policies);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,PolicyOwner,CISO,Auditor,PolicyApprover,EndUser")]
    public async Task<ActionResult<PolicyDto>> GetPolicyById(Guid id)
    {
        var policy = await _mediator.Send(new GetPolicyByIdQuery(id));
        if (policy == null) return NotFound();
        return Ok(policy);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,PolicyOwner")]
    public async Task<ActionResult> UpdatePolicy(Guid id, [FromBody] UpdatePolicyCommand command)
    {
        if (id != command.Id) return BadRequest();

        var result = await _mediator.Send(command);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    public async Task<ActionResult> DeletePolicy(Guid id)
    {
        var result = await _mediator.Send(new DeletePolicyCommand(id));
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,PolicyOwner")]
    public async Task<ActionResult> SubmitPolicyForApproval(Guid id)
    {
        await _mediator.Send(new SubmitPolicyForApprovalCommand(id));
        return NoContent();
    }

    [HttpPost("{id}/review")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,CISO")]
    public async Task<ActionResult> ReviewPolicy(Guid id, [FromBody] ReviewPolicyCommand command)
    {
        if (id != command.PolicyId) return BadRequest();
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}/reviews")]
    [Authorize(Roles = "Administrator,ComplianceOfficer,PolicyOwner,CISO,Auditor")]
    public async Task<ActionResult<List<PolicyReviewDto>>> GetPolicyReviews(Guid id)
    {
        var reviews = await _mediator.Send(new GetPolicyReviewsQuery(id));
        return Ok(reviews);
    }

    [HttpPost("trigger-reminders")]
    public async Task<ActionResult<int>> TriggerReminders([FromQuery] int daysBeforeExpiration = 30)
    {
        var command = new Draxlmaier.GRC.Application.Policies.Commands.SendPolicyRemindersCommand 
        { 
            DaysBeforeExpiration = daysBeforeExpiration 
        };
        var sentCount = await _mediator.Send(command);
        return Ok(sentCount);
    }
}
