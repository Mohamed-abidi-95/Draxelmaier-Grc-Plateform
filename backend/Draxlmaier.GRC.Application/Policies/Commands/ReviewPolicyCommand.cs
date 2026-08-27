using System;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Domain.Entities;
using Draxlmaier.GRC.Domain.Enums;
using MediatR;

namespace Draxlmaier.GRC.Application.Policies.Commands;

public record ReviewPolicyCommand(
    Guid PolicyId, 
    string ReviewerId, 
    bool IsApproved, 
    string Comments) : IRequest;

public class ReviewPolicyCommandHandler : IRequestHandler<ReviewPolicyCommand>
{
    private readonly IApplicationDbContext _context;

    public ReviewPolicyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ReviewPolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await _context.Policies.FindAsync(new object[] { request.PolicyId }, cancellationToken);
        
        if (policy == null)
            throw new Exception("Policy not found");

        if (policy.Status != PolicyStatus.PendingApproval)
            throw new Exception("Policy is not pending approval");

        // Create the review record
        var review = new PolicyReview
        {
            Id = Guid.NewGuid(),
            PolicyId = request.PolicyId,
            ReviewerId = request.ReviewerId,
            IsApproved = request.IsApproved,
            Comments = request.Comments,
            ReviewedAt = DateTime.UtcNow
        };

        _context.PolicyReviews.Add(review);

        // Update the policy status
        policy.Status = request.IsApproved ? PolicyStatus.Active : PolicyStatus.Rejected;
        policy.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
