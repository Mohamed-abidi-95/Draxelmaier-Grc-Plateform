using Microsoft.AspNetCore.Identity;
using System;

namespace Draxlmaier.GRC.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public Guid OrganizationId { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
