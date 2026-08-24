using System;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Draxlmaier.GRC.Application.Users.Commands;

public class ResetUserPasswordCommand : IRequest<bool>
{
    public Guid UserId { get; set; }

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
