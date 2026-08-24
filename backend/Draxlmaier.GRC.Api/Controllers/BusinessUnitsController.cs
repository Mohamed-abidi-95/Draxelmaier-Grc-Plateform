using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.BusinessUnits;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class BusinessUnitsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BusinessUnitsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<BusinessUnitDto>>> GetBusinessUnits([FromQuery] Guid organizationId)
    {
        // En vrai, organizationId devrait venir du token de l'utilisateur (via un user service), 
        // mais pour l'instant on le prend en query ou on l'extrait du claims
        var claim = User.FindFirst("OrganizationId");
        if (claim != null && Guid.TryParse(claim.Value, out var orgId))
        {
            organizationId = orgId;
        }

        var result = await _mediator.Send(new GetBusinessUnitsQuery { OrganizationId = organizationId });
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<Guid>> CreateBusinessUnit(CreateBusinessUnitCommand command)
    {
        var claim = User.FindFirst("OrganizationId");
        if (claim != null && Guid.TryParse(claim.Value, out var orgId))
        {
            command.OrganizationId = orgId;
        }

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
