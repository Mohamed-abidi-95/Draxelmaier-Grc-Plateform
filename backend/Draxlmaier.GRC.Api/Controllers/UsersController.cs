using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Users.Commands;
using Draxlmaier.GRC.Application.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Draxlmaier.GRC.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Administrator")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _mediator.Send(new GetUsersQuery());
        return Ok(users);
    }

    [HttpPut("{id}/role")]
    public async Task<ActionResult> UpdateUserRole(Guid id, [FromBody] UpdateRoleRequest request)
    {
        var result = await _mediator.Send(new UpdateUserRoleCommand { UserId = id, Role = request.Role });
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var result = await _mediator.Send(new DeleteUserCommand { UserId = id });
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/password")]
    public async Task<ActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        try
        {
            var result = await _mediator.Send(new ResetUserPasswordCommand { UserId = id, NewPassword = request.NewPassword });
            if (!result) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}
