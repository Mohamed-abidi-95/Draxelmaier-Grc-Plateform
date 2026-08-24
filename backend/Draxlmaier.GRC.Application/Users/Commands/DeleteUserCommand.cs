using System;
using MediatR;

namespace Draxlmaier.GRC.Application.Users.Commands;

public class DeleteUserCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
}
