using System.Threading.Tasks;

namespace Draxlmaier.GRC.Application.Common.Interfaces;

public class LoginResultDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class UserDto
{
    public System.Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public interface IIdentityService
{
    Task<bool> RegisterUserAsync(string email, string firstName, string lastName, string password, string role);
    Task<LoginResultDto?> LoginAsync(string email, string password);
    Task<string> GetUserNameAsync(System.Guid userId);
    Task<System.Collections.Generic.List<UserDto>> GetUsersAsync();
    Task<bool> UpdateUserRoleAsync(System.Guid userId, string newRole);
    Task<bool> ResetUserPasswordAsync(System.Guid userId, string newPassword);
    Task<bool> DeleteUserAsync(System.Guid userId);
}
