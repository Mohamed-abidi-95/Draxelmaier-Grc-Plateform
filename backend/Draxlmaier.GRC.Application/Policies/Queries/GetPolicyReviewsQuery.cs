using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Application.Policies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Draxlmaier.GRC.Application.Policies.Queries;

public record GetPolicyReviewsQuery(Guid PolicyId) : IRequest<List<PolicyReviewDto>>;

public class GetPolicyReviewsQueryHandler : IRequestHandler<GetPolicyReviewsQuery, List<PolicyReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPolicyReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PolicyReviewDto>> Handle(GetPolicyReviewsQuery request, CancellationToken cancellationToken)
    {
        return await _context.PolicyReviews
            .Where(pr => pr.PolicyId == request.PolicyId)
            .Select(pr => new PolicyReviewDto
            {
                Id = pr.Id,
                PolicyId = pr.PolicyId,
                ReviewerId = pr.ReviewerId,
                IsApproved = pr.IsApproved,
                Comments = pr.Comments,
                ReviewedAt = pr.ReviewedAt
            })
            .OrderByDescending(pr => pr.ReviewedAt)
            .ToListAsync(cancellationToken);
    }
}
