using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.DirectoryServices.AccountManagement;
using System.Security.Principal;

var builder = WebApplication.CreateBuilder(args);

// Add Windows Authentication (Active Directory)
builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
    .AddNegotiate();

// Configure authorization - allow anonymous in dev mode when EVOMNI_DEV=1
var isDevelopmentBypass = Environment.GetEnvironmentVariable("EVOMNI_DEV") == "1";

if (!isDevelopmentBypass)
{
    builder.Services.AddAuthorization(options =>
    {
        // Require authenticated users for all endpoints in production
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    });
}
else
{
    builder.Services.AddAuthorization();
    Console.WriteLine("=== EVOMNI_DEV=1: Active Directory authentication bypassed ===");
}

// Add rate limiting to prevent abuse
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var user = context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: user,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            });
    });
    
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken);
    };
});

// Configure CORS: in development or when EVOMNI_DEV=1 allow any origin (convenient for Electron/file://).
// In other environments keep the restricted Vite origins.
var MyAllowSpecificOrigins = "EvoLocalCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        var env = builder.Environment;
        var permissive = env.IsDevelopment() || Environment.GetEnvironmentVariable("EVOMNI_DEV") == "1";
        if (permissive)
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Required for Windows Auth
        }
        else
        {
            policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'");
    await next();
});

app.UseCors(MyAllowSpecificOrigins);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Middleware to validate Active Directory user
static bool IsValidNetworkUser(HttpContext context)
{
    try
    {
        // Development bypass - skip AD check when EVOMNI_DEV=1
        var isDev = Environment.GetEnvironmentVariable("EVOMNI_DEV") == "1";
        if (isDev)
        {
            Console.WriteLine($"[DEV MODE] Bypassing AD authentication check (EVOMNI_DEV=1)");
            return true;
        }
        
        var user = context.User.Identity;
        if (user == null || !user.IsAuthenticated)
        {
            return false;
        }

        // Verify user exists in Active Directory (Windows only)
        if (!OperatingSystem.IsWindows())
        {
            return user.IsAuthenticated; // On non-Windows, just check if authenticated
        }
        
        var windowsIdentity = context.User.Identity as WindowsIdentity;
        if (windowsIdentity == null)
        {
            return false;
        }

        // Additional AD validation (optional - checks if user account is enabled)
        try
        {
            using (var principalContext = new PrincipalContext(ContextType.Domain))
            using (var userPrincipal = UserPrincipal.FindByIdentity(principalContext, windowsIdentity.Name))
            {
                if (userPrincipal == null || !userPrincipal.Enabled.GetValueOrDefault(false))
                {
                    return false;
                }
            }
        }
        catch
        {
            // If AD lookup fails, fallback to basic Windows authentication check
            // This allows the API to work even if AD queries are restricted
        }

        return true;
    }
    catch
    {
        return false;
    }
}

app.MapGet("/api/health", (HttpContext context) => 
{
    var isDev = Environment.GetEnvironmentVariable("EVOMNI_DEV") == "1";
    
    // In dev mode, bypass auth check
    if (isDev)
    {
        return Results.Ok(new { 
            ok = true, 
            user = "DevUser (EVOMNI_DEV=1)",
            authenticated = true,
            devMode = true
        });
    }
    
    if (!IsValidNetworkUser(context))
    {
        return Results.Json(
            new { error = "User Not authorized", message = "You must be a valid network user to access this resource." },
            statusCode: 401
        );
    }
    
    return Results.Ok(new { 
        ok = true, 
        user = context.User.Identity?.Name ?? "Unknown",
        authenticated = context.User.Identity?.IsAuthenticated ?? false
    });
});

app.MapGet("/api/admin", (HttpContext context) => 
{
    var isDev = Environment.GetEnvironmentVariable("EVOMNI_DEV") == "1";
    var username = "DevUser (EVOMNI_DEV=1)";
    
    // In dev mode, bypass auth check
    if (isDev)
    {
        Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [DEV MODE] Admin data accessed (EVOMNI_DEV=1)");
    }
    else
    {
        // Validate user is a valid network user in production
        if (!IsValidNetworkUser(context))
        {
            return Results.Json(
                new { error = "User Not authorized", message = "You must be a valid network user to access this resource." },
                statusCode: 401
            );
        }
        
        username = context.User.Identity?.Name ?? "Unknown";
        Console.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Admin data accessed by: {username}");
    }
    
    var mockDataChecks = new[] {
        new { id = "dc1", name = "Data Validation Check", description = "Validates input data formats", key = "data-validation-check", sqlSelect = "SELECT * FROM validation WHERE format IS NOT NULL", sortOrder = 1, status = "Active", rules = new[] { "non-null", "format-check" }, isShared = true },
        new { id = "dc2", name = "Range Check", description = "Validates numeric ranges", key = "range-check", sqlSelect = "SELECT * FROM data WHERE value BETWEEN min AND max", sortOrder = 2, status = "Active", rules = new[] { "min-max" }, isShared = false },
        new { id = "dc3", name = "Duplicate Check", description = "Checks for duplicate entries", key = "duplicate-check", sqlSelect = "SELECT id, COUNT(*) FROM records GROUP BY id HAVING COUNT(*) > 1", sortOrder = 3, status = "Active", rules = new[] { "unique" }, isShared = true }
    };

    var mockSettings = new[] {
        new { id = "s1", key = "max-connections", name = "Max Connections", value = "100", type = "number", description = "Maximum number of concurrent connections", status = "Active" },
        new { id = "s2", key = "debug-mode", name = "Debug Mode", value = "false", type = "boolean", description = "Enable debug logging", status = "Active" },
        new { id = "s3", key = "api-endpoint", name = "API Endpoint", value = "https://api.example.com", type = "string", description = "Primary API endpoint", status = "Active" }
    };

    var mockExportZones = new[] {
        new { id = "ez1", name = "Local", description = "Local file system export", key = "local", debugPath = "C:\\Debug\\Exports\\Local", releasePath = "C:\\Release\\Exports\\Local", sortOrder = 1, status = "Active" },
        new { id = "ez2", name = "P6 Admin", description = "P6 Administration export", key = "p6-admin", debugPath = "C:\\Debug\\Exports\\P6Admin", releasePath = "C:\\Release\\Exports\\P6Admin", sortOrder = 2, status = "Active" },
        new { id = "ez3", name = "WebApp", description = "Web application export", key = "webapp", debugPath = "C:\\Debug\\Exports\\WebApp", releasePath = "C:\\Release\\Exports\\WebApp", sortOrder = 3, status = "Active" }
    };

    var mockExportPresets = new[] {
        new { id = "ep1", name = "Check All", description = "Select all export zones", key = "check-all", presetSettings = "All zones enabled", sortOrder = 1, status = "Active", zones = new[] { "ez1", "ez2", "ez3" }, schedule = "0 2 * * *", canCopy = true },
        new { id = "ep2", name = "Uncheck All", description = "Deselect all export zones", key = "uncheck-all", presetSettings = "All zones disabled", sortOrder = 2, status = "Active", zones = new string[] {}, schedule = "0 6 * * *", canCopy = true },
        new { id = "ep3", name = "Cluster 1 - All", description = "All export zones for Cluster 1", key = "cluster-1-all", presetSettings = "Cluster 1 configuration", sortOrder = 3, status = "Active", zones = new[] { "ez1" }, schedule = "0 3 * * *", canCopy = true },
        new { id = "ep4", name = "Cluster 2 - All", description = "All export zones for Cluster 2", key = "cluster-2-all", presetSettings = "Cluster 2 configuration", sortOrder = 4, status = "Active", zones = new[] { "ez2" }, schedule = "0 4 * * *", canCopy = true }
    };

    var mockTabSettings = new[] {
        new { id = "ts1", key = "tab-refresh-rate", name = "Tab Refresh Rate", value = "30", type = "number", description = "Auto-refresh interval in seconds", status = "Active" },
        new { id = "ts2", key = "enable-auto-save", name = "Enable Auto Save", value = "true", type = "boolean", description = "Automatically save changes", status = "Active" },
        new { id = "ts3", key = "display-mode", name = "Display Mode", value = "compact", type = "string", description = "UI display mode (compact/expanded)", status = "Active" }
    };

    var mockSlots = new[] {
        new { id = "slot1", name = "Cluster 1", description = "Primary processing cluster", settings = mockSettings, exportZones = mockExportZones, dataChecks = mockDataChecks },
        new { id = "slot2", name = "Cluster 2", description = "Secondary processing cluster", settings = mockSettings, exportZones = mockExportZones, dataChecks = mockDataChecks }
    };

    var mockTabs = new[] {
        new { id = "tab1", name = "EM", description = "Event Management tab", key = "em", sortOrder = 1, status = "Active", settings = mockTabSettings, exportZones = mockExportZones, exportPresets = mockExportPresets, slots = mockSlots },
        new { id = "tab2", name = "CAP-1", description = "Capacity Analysis 1", key = "cap-1", sortOrder = 2, status = "Active", settings = mockTabSettings, exportZones = mockExportZones, exportPresets = mockExportPresets, slots = mockSlots },
        new { id = "tab3", name = "CAP-2", description = "Capacity Analysis 2", key = "cap-2", sortOrder = 3, status = "Active", settings = mockTabSettings, exportZones = mockExportZones, exportPresets = mockExportPresets, slots = mockSlots }
    };

    var mockApps = new[] {
        new { id = "evms", name = "EVMS", key = "evms", description = "Event Management System", status = "Active", dataChecks = mockDataChecks, settings = mockSettings, tabs = mockTabs },
        new { id = "evfc", name = "EVFC", key = "evfc", description = "Event Flow Controller", status = "Active", dataChecks = mockDataChecks, settings = mockSettings, tabs = mockTabs },
        new { id = "evcsa", name = "EVCSA", key = "evcsa", description = "Event Compliance and Security Auditor", status = "Active", dataChecks = mockDataChecks, settings = mockSettings, tabs = mockTabs },
        new { id = "ava", name = "AVA", key = "ava", description = "Automated Validation Agent", status = "Active", dataChecks = mockDataChecks, settings = mockSettings, tabs = mockTabs },
        new { id = "evbf", name = "EVBF", key = "evbf", description = "Event Business Framework", status = "Active", dataChecks = mockDataChecks, settings = mockSettings, tabs = mockTabs },
        new { id = "evutil", name = "EVUTIL", key = "evutil", description = "Event Utilities", status = "Inactive", dataChecks = mockDataChecks, settings = mockSettings, tabs = mockTabs }
    };

    var mockEventJobs = new[] {
        new { id = "ej1", name = "Daily Cleanup", description = "Daily system cleanup job", trigger = "schedule", action = "cleanup", isActive = true, schedule = "0 3 * * *" },
        new { id = "ej2", name = "Health Check", description = "System health monitoring", trigger = "interval", action = "health-check", isActive = true, schedule = (string?)null }
    };

    return Results.Ok(new {
        apps = mockApps,
        globalExportZones = mockExportZones,
        eventJobs = mockEventJobs,
        authenticatedUser = username,
        timestamp = DateTime.UtcNow
    });
});

app.MapGet("/api/dashboard", (HttpContext context, string? start, string? end) => 
{
    var isDev = Environment.GetEnvironmentVariable("EVOMNI_DEV") == "1";
    var username = "DevUser (EVOMNI_DEV=1)";
    
    // In dev mode, bypass auth check
    if (!isDev)
    {
        // Validate user is authorized in production
        if (!IsValidNetworkUser(context))
        {
            return Results.Json(
                new { error = "User Not authorized", message = "You must be a valid network user to access this resource." },
                statusCode: 401
            );
        }
        username = context.User.Identity?.Name ?? "Unknown";
    }
    
    // In this mock API we just echo the requested date range and optionally include it in the payload.
    var projects = new[] {
        new { id = 1, name = "Project A", status = "Green", progress = 75, budgetTotal = 250000, budgetSpent = 120000 },
        new { id = 2, name = "Project B", status = "Amber", progress = 40, budgetTotal = 180000, budgetSpent = 72000 },
        new { id = 3, name = "EM", status = "Green", progress = 55, budgetTotal = 150000, budgetSpent = 82000 }
    };

    return Results.Ok(new {
        requestedRange = new { start = start, end = end },
        kpis = new { EV = 1234, PV = 1200 },
        projects = projects,
        authenticatedUser = username
    });
});

app.Run("http://localhost:5005");
