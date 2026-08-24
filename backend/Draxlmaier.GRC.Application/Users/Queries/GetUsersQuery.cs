using System.Collections.Generic;
using Draxlmaier.GRC.Application.Common.Interfaces;
using MediatR;

namespace Draxlmaier.GRC.Application.Users.Queries;

public class GetUsersQuery : IRequest<List<UserDto>>
{
}
