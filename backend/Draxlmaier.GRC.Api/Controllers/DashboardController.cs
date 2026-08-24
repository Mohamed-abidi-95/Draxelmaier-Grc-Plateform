using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Dashboard.DTOs;
using Draxlmaier.GRC.Application.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetricsDto>> GetMetrics()
    {
        var metrics = await _mediator.Send(new GetDashboardMetricsQuery());
        return Ok(metrics);
    }
}
