using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Compliance.Commands;
using Draxlmaier.GRC.Application.Compliance.DTOs;
using Draxlmaier.GRC.Application.Compliance.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class MappingsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MappingsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize(Roles = "ComplianceOfficer,Administrator,PolicyOwner")]
        public async Task<ActionResult<List<ControlMappingDto>>> GetMappings([FromQuery] Guid? requirementId)
        {
            var mappings = await _mediator.Send(new GetControlMappingsQuery { RequirementId = requirementId });
            return Ok(mappings);
        }

        [HttpPost]
        [Authorize(Roles = "ComplianceOfficer,Administrator")]
        public async Task<ActionResult<Guid>> CreateMapping([FromBody] CreateControlMappingCommand command)
        {
            var mappingId = await _mediator.Send(command);
            return Ok(new { mappingId });
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "ComplianceOfficer,Administrator")]
        public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateControlMappingStatusCommand command)
        {
            if (id != command.MappingId)
            {
                return BadRequest("ID mismatch");
            }
            
            var result = await _mediator.Send(command);
            
            if (!result)
                return NotFound();
                
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ComplianceOfficer,Administrator")]
        public async Task<ActionResult> DeleteMapping(Guid id)
        {
            var result = await _mediator.Send(new DeleteControlMappingCommand { Id = id });
            if (!result) return NotFound();

            return NoContent();
        }
    }
}
