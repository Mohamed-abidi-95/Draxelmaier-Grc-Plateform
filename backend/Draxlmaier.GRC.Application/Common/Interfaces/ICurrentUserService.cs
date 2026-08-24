using System;

namespace Draxlmaier.GRC.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
}
