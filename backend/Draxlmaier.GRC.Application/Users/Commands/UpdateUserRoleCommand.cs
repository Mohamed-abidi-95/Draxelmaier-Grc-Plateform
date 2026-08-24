using System;
using MediatR;

namespace Draxlmaier.GRC.Application.Users.Commands;

public class UpdateUserRoleCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
}
