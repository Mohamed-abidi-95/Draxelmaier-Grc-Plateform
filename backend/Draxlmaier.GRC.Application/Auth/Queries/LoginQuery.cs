using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;

namespace Draxlmaier.GRC.Application.Auth.Queries;

public class LoginQuery : IRequest<LoginResultDto?>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
