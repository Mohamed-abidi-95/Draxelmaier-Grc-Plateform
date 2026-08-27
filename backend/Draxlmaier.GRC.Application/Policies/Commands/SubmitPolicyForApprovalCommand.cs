using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public record SubmitPolicyForApprovalCommand(Guid PolicyId) : IRequest;

public class SubmitPolicyForApprovalCommandHandler : IRequestHandler<SubmitPolicyForApprovalCommand>
{
    private readonly IApplicationDbContext _context;

    public SubmitPolicyForApprovalCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SubmitPolicyForApprovalCommand request, CancellationToken cancellationToken)
    {
        var policy = await _context.Policies.FindAsync(new object[] { request.PolicyId }, cancellationToken);
        if (policy == null)
            throw new Exception("Policy not found");

        if (policy.Status != PolicyStatus.Draft && policy.Status != PolicyStatus.Rejected)
            throw new Exception("Only Draft or Rejected policies can be submitted for approval");

        policy.Status = PolicyStatus.PendingApproval;
        policy.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
