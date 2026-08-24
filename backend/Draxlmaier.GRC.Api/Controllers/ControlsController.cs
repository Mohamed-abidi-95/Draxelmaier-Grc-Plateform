using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Controls.Commands;
using Draxlmaier.GRC.Application.Controls.DTOs;
using Draxlmaier.GRC.Application.Controls.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class ControlsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ControlsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,ComplianceOfficer")]
        public async Task<ActionResult<Guid>> CreateControl([FromBody] CreateControlCommand command)
        {
            var controlId = await _mediator.Send(command);
            return Ok(new { controlId });
        }

        [HttpGet]
        [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor,RiskOwner")]
        public async Task<ActionResult<List<ControlDto>>> GetControls([FromQuery] Guid organizationId)
        {
            var controls = await _mediator.Send(new GetControlsQuery { OrganizationId = organizationId });
            return Ok(controls);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator,ComplianceOfficer,CISO,Auditor,RiskOwner")]
        public async Task<ActionResult<ControlDto>> GetControlById(Guid id)
        {
            var control = await _mediator.Send(new GetControlByIdQuery { Id = id });
            if (control == null) return NotFound();
            return Ok(control);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,ComplianceOfficer")]
        public async Task<ActionResult> UpdateControl(Guid id, [FromBody] UpdateControlCommand command)
        {
            if (id != command.Id) return BadRequest();

            var result = await _mediator.Send(command);
            if (!result) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult> DeleteControl(Guid id)
        {
            var result = await _mediator.Send(new DeleteControlCommand { Id = id });
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
