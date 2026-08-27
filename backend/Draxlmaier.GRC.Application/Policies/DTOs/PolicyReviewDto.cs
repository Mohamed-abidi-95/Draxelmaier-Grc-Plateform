using System;

namespace Draxlmaier.GRC.Application.Policies.DTOs;

public class PolicyReviewDto
{
    public Guid Id { get; set; }
    public Guid PolicyId { get; set; }
    public string ReviewerId { get; set; } = string.Empty;
    public string? ReviewerName { get; set; }
    public bool IsApproved { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime ReviewedAt { get; set; }
}
