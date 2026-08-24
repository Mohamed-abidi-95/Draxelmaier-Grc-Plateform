using MediatR;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;

namespace Draxlmaier.GRC.Application.Auth.Queries;

public class LoginQueryHandler : IRequestHandler<LoginQuery, LoginResultDto?>
{
    private readonly IIdentityService _identityService;

    public LoginQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<LoginResultDto?> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.LoginAsync(request.Email, request.Password);
    }
}
