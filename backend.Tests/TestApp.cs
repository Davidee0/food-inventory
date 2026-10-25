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
        await using var db = new NpgsqlConnection(ConnectionString);
        await db.OpenAsync();
        var dir = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(dir, "database"))) dir = Path.GetDirectoryName(dir)!;
        foreach (var f in new[] { "create_tables.sql", "seed_data.sql" })
            await Exec(db, await File.ReadAllTextAsync(Path.Combine(dir, "database", f)));
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

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.ConfigureTestServices(services =>
        {
            foreach (var d in services.Where(d => d.ServiceType.FullName!.Contains("DbContextOptions")
                                                  || d.ServiceType == typeof(AppDbContext)).ToList())
                services.Remove(d);
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(ConnectionString));
        });

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
