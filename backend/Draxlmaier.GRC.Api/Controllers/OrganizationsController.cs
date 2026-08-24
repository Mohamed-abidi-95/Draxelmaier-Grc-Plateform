using Draxlmaier.GRC.Application.Organizations.Commands;
using Draxlmaier.GRC.Application.Organizations.DTOs;
using Draxlmaier.GRC.Application.Organizations.Queries;
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
public class OrganizationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrganizationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<Guid>> CreateOrganization([FromBody] CreateOrganizationCommand command)
    {
        var organizationId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetOrganizations), new { id = organizationId }, organizationId);
    }

    [HttpGet]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<List<OrganizationDto>>> GetOrganizations()
    {
        var organizations = await _mediator.Send(new GetOrganizationsQuery());
        return Ok(organizations);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<OrganizationDto>> GetOrganizationById(Guid id)
    {
        var organization = await _mediator.Send(new GetOrganizationByIdQuery(id));
        if (organization == null) return NotFound();
        return Ok(organization);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationCommand command)
    {
        if (id != command.Id) return BadRequest();
        
        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult> DeleteOrganization(Guid id)
    {
        var result = await _mediator.Send(new DeleteOrganizationCommand(id));
        if (!result) return NotFound();
        
        return NoContent();
    }
}
