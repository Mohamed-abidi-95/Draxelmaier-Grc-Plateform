using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Assets.Commands;
using Draxlmaier.GRC.Application.Assets.DTOs;
using Draxlmaier.GRC.Application.Assets.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AssetsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,RiskOwner")]
    public async Task<ActionResult<Guid>> CreateAsset([FromBody] CreateAssetCommand command)
    {
        var orgIdClaim = User.FindFirst("OrganizationId");
        if (orgIdClaim == null) return Unauthorized("OrganizationId claim is missing.");
        
        command.OrganizationId = Guid.Parse(orgIdClaim.Value);
        
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null)
        {
            command.OwnerId = Guid.Parse(userIdClaim.Value);
        }

        var assetId = await _mediator.Send(command);
        return Ok(assetId);
    }

    [HttpGet]
    [Authorize(Roles = "Administrator,RiskOwner,ComplianceOfficer,CISO,Auditor")]
    public async Task<ActionResult<List<AssetDto>>> GetAssets()
    {
        var orgIdClaim = User.FindFirst("OrganizationId");
        if (orgIdClaim == null) return Unauthorized("OrganizationId claim is missing.");
        
        var query = new GetAssetsQuery { OrganizationId = Guid.Parse(orgIdClaim.Value) };
        var assets = await _mediator.Send(query);
        return Ok(assets);
    }
}
