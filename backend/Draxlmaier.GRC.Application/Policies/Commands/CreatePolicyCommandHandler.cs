using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public class CreatePolicyCommandHandler : IRequestHandler<CreatePolicyCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreatePolicyCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreatePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = new Policy
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OwnerId = _currentUserService.UserId?.ToString() ?? string.Empty,
            OrganizationId = request.OrganizationId,
            ExpiryDate = request.ExpiryDate,
            Status = PolicyStatus.Draft, // Starting status

            DocumentId = request.DocumentId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Policies.Add(policy);
        await _context.SaveChangesAsync(cancellationToken);

        return policy.Id;
    }
}
