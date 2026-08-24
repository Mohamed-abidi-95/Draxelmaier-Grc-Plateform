using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;

namespace Draxlmaier.GRC.Application.Users.Commands;

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, bool>
{
    private readonly IIdentityService _identityService;

    public UpdateUserRoleCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<bool> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.UpdateUserRoleAsync(request.UserId, request.Role);
    }
}
