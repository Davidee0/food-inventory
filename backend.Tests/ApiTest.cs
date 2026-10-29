using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace FoodInventory.Api.Tests;

/// <summary>
/// Base for the test classes: every test runs the API on its own brand-new PostgreSQL database,
/// built from the real scripts in /database. Set TEST_DB_ADMIN to use another server.
/// </summary>
public abstract class ApiTest : IAsyncLifetime
{
    private static readonly string Admin = Environment.GetEnvironmentVariable("TEST_DB_ADMIN")
        ?? "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres";

    private static readonly DateTime Now = DateTime.Now; // one reading, so a run across midnight stays consistent
    protected static readonly string Today = AddDays(0);

    private readonly string _database = "food_test_" + Guid.NewGuid().ToString("N");
    private WebApplicationFactory<Program> _app = null!;
    private HttpClient _http = null!;

    private string Connection => new NpgsqlConnectionStringBuilder(Admin) { Database = _database }.ToString();

    public async Task InitializeAsync()
    {
        await Execute(Admin, $"CREATE DATABASE \"{_database}\"");
        await RunScript("create_tables.sql");
        await RunScript("seed_data.sql");
        _app = new WebApplicationFactory<Program>().WithWebHostBuilder(web => web.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = Connection,
                ["Logging:LogLevel:Default"] = "Warning",
            })));
        _http = _app.CreateClient();
    }

    public async Task DisposeAsync()
    {
        await _app.DisposeAsync();
        NpgsqlConnection.ClearAllPools();
        await Execute(Admin, $"DROP DATABASE \"{_database}\" WITH (FORCE)");
    }

    /// <summary>Runs a script from the /database folder on this test's database.</summary>
    protected Task RunScript(string file)
    {
        var folder = AppContext.BaseDirectory;
        while (!Directory.Exists(Path.Combine(folder, "database"))) folder = Path.GetDirectoryName(folder)!;
        return Execute(Connection, File.ReadAllText(Path.Combine(folder, "database", file)));
    }

    protected async Task<long> Count(string sql)
    {
        await using var connection = new NpgsqlConnection(Connection);
        await connection.OpenAsync();
        return (long)(await new NpgsqlCommand(sql, connection).ExecuteScalarAsync())!;
    }

    protected Task Sql(string sql) => Execute(Connection, sql);

    /// <summary>Calls the API. The body is sent as JSON; a string is sent as it is (to test malformed JSON).</summary>
    protected async Task<(HttpStatusCode Status, JsonElement Body)> Api(string method, string path, object? body = null)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), path);
        if (body is not null)
            request.Content = new StringContent(body as string ?? JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        var response = await _http.SendAsync(request);
        var text = await response.Content.ReadAsStringAsync();
        return (response.StatusCode, text.Length > 0 ? JsonDocument.Parse(text).RootElement : default);
    }

    /// <summary>A valid item, with some fields replaced: Good(("name", "Butter")).</summary>
    protected static Dictionary<string, object?> Good(params (string Field, object? Value)[] changes)
    {
        var item = new Dictionary<string, object?>
        {
            ["name"] = "Cheese", ["location_id"] = 1, ["category_id"] = null, ["purchase_date"] = Today, ["best_before"] = null,
        };
        foreach (var (field, value) in changes) item[field] = value;
        return item;
    }

    protected static string AddDays(int days) => Now.AddDays(days).ToString("yyyy-MM-dd");

    protected static string? Text(JsonElement body, string field) => body.GetProperty(field).GetString();

    private static async Task Execute(string connectionString, string sql)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await new NpgsqlCommand(sql, connection).ExecuteNonQueryAsync();
    }
}
