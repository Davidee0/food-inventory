using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace FoodInventory.Api.Tests;

/// <summary>Read-only checks of the API contract, sharing one seeded database.</summary>
public class ApiContractTests : IClassFixture<TestApp>
{
    private readonly TestApp _app;
    public ApiContractTests(TestApp app) => _app = app;

    [Theory]
    [InlineData("+1")]
    [InlineData("%201")]
    [InlineData("1%20")]
    [InlineData("1.0")]
    [InlineData("1e0")]
    [InlineData("0x1")]
    [InlineData("-1")]
    [InlineData("1,0")]
    [InlineData("abc")]
    [InlineData("99999999999")]
    public async Task Ids_must_be_digits_only_otherwise_404(string id)
    {
        foreach (var (resource, message) in new[] { ("items", "Item not found."), ("categories", "Category not found.") })
        {
            foreach (var method in new[] { HttpMethod.Get, HttpMethod.Put, HttpMethod.Delete })
            {
                if (resource == "categories" && method == HttpMethod.Get) continue; // no GET /categories/{id}
                var body = method == HttpMethod.Put
                    ? (resource == "items" ? """{"name":"a","location_id":1,"purchase_date":"2026-01-01"}""" : """{"name":"a"}""")
                    : null;
                var r = await _app.Send(method, $"/{resource}/{id}", body);
                Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
                Assert.Equal(message, (await TestApp.Body(r)).GetProperty("message").GetString());
            }
        }
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM items"));
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM categories"));
    }

    [Theory]
    [InlineData("""{"name":"\ud800","location_id":1,"purchase_date":"2026-01-01"}""")]
    [InlineData("""{"name":"a\u0000b","location_id":1,"purchase_date":"2026-01-01"}""")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-0\u00001"}""")]
    public async Task Text_that_can_never_be_stored_gives_400_not_500(string json)
    {
        foreach (var r in new[] { await _app.Post("/items", json), await _app.Put("/items/1", json), await _app.Post("/categories", json), await _app.Put("/categories/1", json) })
        {
            Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
            Assert.Equal("The request body is not valid JSON.", (await TestApp.Body(r)).GetProperty("message").GetString());
        }
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM items"));
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM categories"));
    }

    [Fact]
    public async Task Invalid_utf8_bytes_give_400_not_500()
    {
        byte[] bytes = [.. "{\"name\":\""u8, 0xFF, 0xFE, .. "\",\"location_id\":1,\"purchase_date\":\"2026-01-01\"}"u8];
        var content = new ByteArrayContent(bytes) { Headers = { ContentType = new MediaTypeHeaderValue("application/json") } };
        var r = await _app.Http.PostAsync("/items", content);
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        Assert.Equal("The request body is not valid JSON.", (await TestApp.Body(r)).GetProperty("message").GetString());
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM items"));
    }

    [Fact]
    public async Task Swagger_describes_a_json_request_body_for_every_POST_and_PUT()
    {
        var r = await _app.Get("/swagger/v1/swagger.json");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        var paths = (await TestApp.Body(r)).GetProperty("paths");
        var withBody = 0;
        foreach (var path in paths.EnumerateObject())
            foreach (var op in path.Value.EnumerateObject())
            {
                if (op.Name is "post" or "put")
                {
                    var content = op.Value.GetProperty("requestBody").GetProperty("content").GetProperty("application/json");
                    Assert.True(content.TryGetProperty("schema", out _), $"{op.Name} {path.Name} has no schema");
                    Assert.True(content.TryGetProperty("example", out _), $"{op.Name} {path.Name} has no example");
                    withBody++;
                }
            }
        Assert.Equal(4, withBody); // POST/PUT items and categories
    }

    [Fact]
    public async Task Swagger_ui_is_served()
    {
        var r = await _app.Get("/swagger/index.html");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
    }

    [Fact]
    public async Task Cors_allows_the_angular_dev_server_and_nobody_else()
    {
        var allowed = new HttpRequestMessage(HttpMethod.Options, "/items/1");
        allowed.Headers.Add("Origin", "http://localhost:4200");
        allowed.Headers.Add("Access-Control-Request-Method", "PUT");
        allowed.Headers.Add("Access-Control-Request-Headers", "content-type");
        var ok = await _app.Http.SendAsync(allowed);
        Assert.Equal("http://localhost:4200", ok.Headers.GetValues("Access-Control-Allow-Origin").Single());
        Assert.Contains("PUT", ok.Headers.GetValues("Access-Control-Allow-Methods").Single());

        var other = new HttpRequestMessage(HttpMethod.Get, "/items");
        other.Headers.Add("Origin", "http://evil.example");
        Assert.False((await _app.Http.SendAsync(other)).Headers.Contains("Access-Control-Allow-Origin"));
    }
}

public class ServerErrorTests : IClassFixture<BrokenDatabaseApp>
{
    private readonly HttpClient _http;
    public ServerErrorTests(BrokenDatabaseApp app) => _http = app.CreateClient();

    [Theory]
    [InlineData("GET", "/items", null)]
    [InlineData("GET", "/locations", null)]
    [InlineData("GET", "/categories", null)]
    [InlineData("POST", "/categories", """{"name":"Snacks"}""")]
    [InlineData("POST", "/items", """{"name":"a","location_id":1,"purchase_date":"2026-01-01"}""")]
    [InlineData("DELETE", "/items/1", null)]
    public async Task Unexpected_failures_give_500_with_the_plain_message(string method, string url, string? json)
    {
        var req = new HttpRequestMessage(new HttpMethod(method), url);
        if (json is not null) req.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var r = await _http.SendAsync(req);
        Assert.Equal(HttpStatusCode.InternalServerError, r.StatusCode);
        var body = await r.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Something went wrong on the server.", body.GetProperty("message").GetString());
    }
}
