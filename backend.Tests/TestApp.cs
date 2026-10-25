using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Npgsql;
using FoodInventory.Api.Data;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodInventory.Api.Tests;

/// <summary>
/// Runs the API against a brand-new PostgreSQL database built from the real
/// database/create_tables.sql + seed_data.sql. One database per test class.
/// Admin connection: env TEST_DB_ADMIN (default local postgres/postgres).
/// </summary>
public class TestApp : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _dbName = "fi_test_" + Guid.NewGuid().ToString("N");
    private static string Admin => Environment.GetEnvironmentVariable("TEST_DB_ADMIN")
        ?? "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres";

    public string ConnectionString => new NpgsqlConnectionStringBuilder(Admin) { Database = _dbName }.ConnectionString;
    public HttpClient Http { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await using (var admin = new NpgsqlConnection(Admin))
        {
            await admin.OpenAsync();
            await Exec(admin, $"CREATE DATABASE \"{_dbName}\"");
        }
        await RunScript("create_tables.sql");
        await RunScript("seed_data.sql");
        Http = CreateClient();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        Http.Dispose();
        await base.DisposeAsync();
        NpgsqlConnection.ClearAllPools();
        await using var admin = new NpgsqlConnection(Admin);
        await admin.OpenAsync();
        await Exec(admin, $"DROP DATABASE IF EXISTS \"{_dbName}\" WITH (FORCE)");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Quiet(builder, "Warning"); // keep SQL logging out of the test output
        builder.ConfigureTestServices(services => UseDatabase(services, ConnectionString));
    }

    public static void Quiet(IWebHostBuilder builder, string level) =>
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
            new Dictionary<string, string?> { ["Logging:LogLevel:Default"] = level, ["Logging:LogLevel:Microsoft.AspNetCore"] = level }));

    /// <summary>Points the API at another database, replacing the one from appsettings.json.</summary>
    public static void UseDatabase(IServiceCollection services, string connectionString)
    {
        foreach (var d in services.Where(d => d.ServiceType.FullName!.Contains("DbContextOptions")
                                              || d.ServiceType == typeof(AppDbContext)).ToList())
            services.Remove(d);
        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));
    }

    /// <summary>Runs one of the real scripts from the /database folder against this test database.</summary>
    public async Task RunScript(string fileName)
    {
        var dir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(dir, "database"))) dir = Path.GetDirectoryName(dir)!;
        await using var c = new NpgsqlConnection(ConnectionString);
        await c.OpenAsync();
        await Exec(c, await File.ReadAllTextAsync(Path.Combine(dir, "database", fileName)));
    }

    static async Task Exec(NpgsqlConnection c, string sql)
    {
        await using var cmd = new NpgsqlCommand(sql, c);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<long> Scalar(string sql)
    {
        await using var c = new NpgsqlConnection(ConnectionString);
        await c.OpenAsync();
        await using var cmd = new NpgsqlCommand(sql, c);
        return Convert.ToInt64(await cmd.ExecuteScalarAsync());
    }

    public Task<HttpResponseMessage> Send(HttpMethod method, string url, string? rawJson = null)
    {
        var req = new HttpRequestMessage(method, url);
        if (rawJson is not null) req.Content = new StringContent(rawJson, Encoding.UTF8, "application/json");
        return Http.SendAsync(req);
    }

    public Task<HttpResponseMessage> Post(string url, string json) => Send(HttpMethod.Post, url, json);
    public Task<HttpResponseMessage> Put(string url, string json) => Send(HttpMethod.Put, url, json);
    public Task<HttpResponseMessage> Delete(string url) => Send(HttpMethod.Delete, url);
    public Task<HttpResponseMessage> Get(string url) => Send(HttpMethod.Get, url);

    public static async Task<JsonElement> Body(HttpResponseMessage r) =>
        (await r.Content.ReadFromJsonAsync<JsonElement>());

    public static async Task<Dictionary<string, string>> Errors(HttpResponseMessage r)
    {
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        var body = await Body(r);
        return body.GetProperty("errors").EnumerateObject().ToDictionary(p => p.Name, p => p.Value.GetString()!);
    }
}


/// <summary>The API with a database that cannot be reached, to check the 500 response.</summary>
public class BrokenDatabaseApp : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        TestApp.Quiet(builder, "None"); // the expected failures would only print stack traces
        builder.ConfigureTestServices(services =>
        {
            TestApp.UseDatabase(services, "Host=localhost;Port=1;Database=nope;Username=nope;Password=nope;Timeout=2;Pooling=false");
        });
    }
}
