using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Audits.Queries;
using Draxlmaier.GRC.Application.Common.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Administrator,CISO,ComplianceOfficer")]
public class AuditLogsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditLogsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetAuditLogs()
    {
        var logs = await _mediator.Send(new GetAuditLogsQuery());
        return Ok(logs);
    }
}
