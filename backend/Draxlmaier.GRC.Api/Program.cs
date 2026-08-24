using Draxlmaier.GRC.Infrastructure.Data;
using Draxlmaier.GRC.Infrastructure.Identity;
using Draxlmaier.GRC.Application.Common.Interfaces;
using Draxlmaier.GRC.Infrastructure.Storage;
using Draxlmaier.GRC.Infrastructure.Services;
using Draxlmaier.GRC.Api.Workers;
using Draxlmaier.GRC.Api.Data;
using Draxlmaier.GRC.Api.Services;
using Draxlmaier.GRC.Domain.Entities;
using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000") // Common React/Vite ports
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Configure Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseVector()));
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

// Configure MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Draxlmaier.GRC.Application.AssemblyReference).Assembly));

// Configure MinIO / S3 File Storage
var minioOptions = new AmazonS3Config
{
    ServiceURL = builder.Configuration["MinIO:Endpoint"],
    ForcePathStyle = true, // Required for MinIO
    UseHttp = true
};
builder.Services.AddSingleton<IAmazonS3>(sp => new AmazonS3Client(
    builder.Configuration["MinIO:AccessKey"],
    builder.Configuration["MinIO:SecretKey"],
    minioOptions));
builder.Services.AddScoped<IFileStorage, MinioFileStorage>();

// AI Services


// Configure Email Service
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

// Register Background Workers
builder.Services.AddHostedService<PolicyReminderWorker>();

// Configure Current User Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IIdentityService, IdentityService>();

// Configure Identity
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddRoles<ApplicationRole>()
.AddEntityFrameworkStores<ApplicationDbContext>();

// Configure Authentication (MVP Phase - JWT Local)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForDevelopmentOnlyReplaceInProduction"))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Seed Default Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
        
        // Ensure Database is created and migrations are applied (uncomment when DB is available)
        // context.Database.Migrate();

        if (!context.Organizations.Any())
        {
            context.Organizations.Add(new Draxlmaier.GRC.Domain.Entities.Organization { Name = "DRÄXLMAIER Group", Description = "Default Organization" });
            context.SaveChanges();
        }

        string[] roleNames = { "Administrator", "ComplianceOfficer", "RiskOwner", "PolicyOwner", "CISO", "Auditor", "EndUser", "PolicyApprover" };
        foreach (var roleName in roleNames)
        {
            if (!roleManager.RoleExistsAsync(roleName).Result)
            {
                roleManager.CreateAsync(new ApplicationRole(roleName)).Wait();
            }
        }

        // Seed test users
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var org = context.Organizations.FirstOrDefault();
        if (org != null)
        {
            var testUsers = new[]
            {
                // Rôles Phase 1 MVP — CONFIRMED (PROJECT_MASTER §3.2)
                new { Email = "admin@draxlmaier.com",       FirstName = "Admin",    LastName = "Draxlmaier", Role = "Administrator"     },
                new { Email = "compliance@draxlmaier.com",  FirstName = "Sarah",    LastName = "Martin",     Role = "ComplianceOfficer" }, // Persona principal MVP
                new { Email = "policyowner@draxlmaier.com", FirstName = "Lukas",    LastName = "Müller",     Role = "PolicyOwner"       },
                new { Email = "riskowner@draxlmaier.com",   FirstName = "Ahmed",    LastName = "Benali",     Role = "RiskOwner"         },
                // Rôles Phase 2 — CdC V2 FR-V2-009
                new { Email = "ciso@draxlmaier.com",        FirstName = "Elena",    LastName = "Schmidt",    Role = "CISO"              },
                new { Email = "auditor@draxlmaier.com",      FirstName = "Thomas",   LastName = "Weber",      Role = "Auditor"           },
                new { Email = "approver@draxlmaier.com",    FirstName = "Marie",    LastName = "Dupont",     Role = "PolicyApprover"    },
                new { Email = "enduser@draxlmaier.com",     FirstName = "Standard", LastName = "User",       Role = "EndUser"           },
            };

            foreach (var t in testUsers)
            {
                if (userManager.FindByEmailAsync(t.Email).Result == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = t.Email,
                        Email = t.Email,
                        FirstName = t.FirstName,
                        LastName = t.LastName,
                        OrganizationId = org.Id,
                        EmailConfirmed = true
                    };
                    var result = userManager.CreateAsync(user, "Admin123!").Result;
                    if (result.Succeeded)
                    {
                        userManager.AddToRoleAsync(user, t.Role).Wait();
                    }
                }
            }
        }

        // Call the CsvDataSeeder
        var loggerFactory = services.GetRequiredService<ILoggerFactory>();
        var seederLogger = loggerFactory.CreateLogger("CsvDataSeeder");
        var datasetsPath = Path.Combine(builder.Environment.ContentRootPath, "..", "..", "docs", "datasets");
        CsvDataSeeder.SeedAsync(context, seederLogger, datasetsPath).Wait();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
app.UseMiddleware<Draxlmaier.GRC.Api.Middleware.GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
