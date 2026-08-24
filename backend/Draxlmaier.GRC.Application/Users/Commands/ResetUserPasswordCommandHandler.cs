using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;

namespace Draxlmaier.GRC.Application.Users.Commands;

public class ResetUserPasswordCommandHandler : IRequestHandler<ResetUserPasswordCommand, bool>
{
    private readonly IIdentityService _identityService;

    public ResetUserPasswordCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<bool> Handle(ResetUserPasswordCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.ResetUserPasswordAsync(request.UserId, request.NewPassword);
    }
}
