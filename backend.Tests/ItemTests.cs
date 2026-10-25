using System.Net;
using System.Text.Json;

namespace FoodInventory.Api.Tests;

public class ItemTests : IAsyncLifetime
{
    // Fresh seeded database per test, so tests never depend on each other.
    private readonly TestApp _app = new();
    public Task InitializeAsync() => ((IAsyncLifetime)_app).InitializeAsync();
    public Task DisposeAsync() => ((IAsyncLifetime)_app).DisposeAsync();

    private const string Valid = """{"name":"Cheese","location_id":1,"category_id":1,"purchase_date":"2026-05-01","best_before":"2026-05-20"}""";

    private async Task<int> CreateItem(string json = Valid)
    {
        var r = await _app.Post("/items", json);
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await TestApp.Body(r)).GetProperty("id").GetInt32();
    }

    [Fact]
    public async Task List_is_sorted_soonest_best_before_first_nulls_last()
    {
        var body = await TestApp.Body(await _app.Get("/items"));
        var names = body.EnumerateArray().Select(i => i.GetProperty("name").GetString()).ToArray();
        Assert.Equal(new[] { "Chicken breast", "Milk", "Orange juice", "Frozen peas", "Frozen berries", "Pasta" }, names);
        var first = body[0];
        foreach (var f in new[] { "id", "name", "purchase_date", "best_before", "location_id", "location_name", "category_id", "category_name" })
            Assert.True(first.TryGetProperty(f, out _), f);
        Assert.Equal("Fridge", first.GetProperty("location_name").GetString());
        Assert.Equal(JsonValueKind.Null, body[5].GetProperty("best_before").ValueKind);
    }

    [Fact]
    public async Task Ties_are_ordered_by_name_ignoring_case()
    {
        await _app.Post("/items", """{"name":"beta","location_id":1,"purchase_date":"2026-01-01","best_before":"2030-01-01"}""");
        await _app.Post("/items", """{"name":"Alpha","location_id":1,"purchase_date":"2026-01-01","best_before":"2030-01-01"}""");
        var body = await TestApp.Body(await _app.Get("/items"));
        var names = body.EnumerateArray().Select(i => i.GetProperty("name").GetString()).ToList();
        Assert.True(names.IndexOf("Alpha") < names.IndexOf("beta"));
    }

    [Fact]
    public async Task Create_trims_name_and_returns_the_item_then_get_replace_delete()
    {
        var r = await _app.Post("/items", """{"name":"  Cheese  ","location_id":1,"category_id":1,"purchase_date":"2026-05-01","best_before":"2026-05-20"}""");
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        var created = await TestApp.Body(r);
        Assert.Equal("Cheese", created.GetProperty("name").GetString());
        Assert.Equal("Dairy", created.GetProperty("category_name").GetString());
        Assert.Equal("2026-05-20", created.GetProperty("best_before").GetString());
        var id = created.GetProperty("id").GetInt32();

        var got = await TestApp.Body(await _app.Get($"/items/{id}"));
        Assert.Equal("Cheese", got.GetProperty("name").GetString());

        var put = await _app.Put($"/items/{id}", """{"name":"Butter","location_id":2,"purchase_date":"2026-05-02"}""");
        Assert.Equal(HttpStatusCode.OK, put.StatusCode);
        var replaced = await TestApp.Body(put);
        Assert.Equal("Butter", replaced.GetProperty("name").GetString());
        Assert.Equal("Freezer", replaced.GetProperty("location_name").GetString());
        Assert.Equal(JsonValueKind.Null, replaced.GetProperty("category_id").ValueKind);
        Assert.Equal(JsonValueKind.Null, replaced.GetProperty("best_before").ValueKind);

        Assert.Equal(HttpStatusCode.NoContent, (await _app.Delete($"/items/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _app.Get($"/items/{id}")).StatusCode);
    }

    [Fact]
    public async Task Deleted_or_non_numeric_ids_give_404_with_message()
    {
        var id = await CreateItem();
        await _app.Delete($"/items/{id}");
        foreach (var path in new[] { $"/items/{id}", "/items/abc", "/items/1.5", "/items/99999999999" })
        {
            foreach (var method in new[] { HttpMethod.Get, HttpMethod.Put, HttpMethod.Delete })
            {
                var r = await _app.Send(method, path, method == HttpMethod.Put ? Valid : null);
                Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
                Assert.Equal("Item not found.", (await TestApp.Body(r)).GetProperty("message").GetString());
            }
        }
    }

    [Fact]
    public async Task Empty_post_reports_name_location_and_purchase_date()
    {
        var errors = await TestApp.Errors(await _app.Post("/items", "{}"));
        Assert.Equal(3, errors.Count);
        Assert.Equal("Enter a name.", errors["name"]);
        Assert.Equal("Choose a storage location.", errors["location_id"]);
        Assert.Equal("Enter a purchase date.", errors["purchase_date"]);
    }

    [Theory]
    [InlineData("""{"name":"   ","location_id":1,"purchase_date":"2026-01-01"}""", "name", "Enter a name.")]
    [InlineData("""{"name":"a","location_id":99,"purchase_date":"2026-01-01"}""", "location_id", "Choose a storage location.")]
    [InlineData("""{"name":"a","location_id":null,"purchase_date":"2026-01-01"}""", "location_id", "Choose a storage location.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":""}""", "purchase_date", "Enter a purchase date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-02-30"}""", "purchase_date", "Enter a valid date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"01/02/2026"}""", "purchase_date", "Enter a valid date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01T00:00:00Z"}""", "purchase_date", "Enter a valid date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01","best_before":"nope"}""", "best_before", "Enter a valid date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01","best_before":"2026-02-30"}""", "best_before", "Enter a valid date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-10","best_before":"2026-01-09"}""", "best_before", "Best before date cannot be before the purchase date.")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01","category_id":999}""", "category_id", "Choose a category from the list.")]
    public async Task Invalid_item_gives_400_with_exact_message(string json, string field, string message)
    {
        foreach (var r in new[] { await _app.Post("/items", json), await _app.Put("/items/1", json) })
        {
            var errors = await TestApp.Errors(r);
            Assert.Equal(message, errors[field]);
        }
    }

    [Fact]
    public async Task Name_longer_than_50_is_rejected_but_exactly_50_is_fine_after_trim()
    {
        var long51 = new string('x', 51);
        var errors = await TestApp.Errors(await _app.Post("/items", $$"""{"name":"{{long51}}","location_id":1,"purchase_date":"2026-01-01"}"""));
        Assert.Equal("Name can be at most 50 characters.", errors["name"]);
        var ok = await _app.Post("/items", $$"""{"name":"  {{new string('x', 50)}}  ","location_id":1,"purchase_date":"2026-01-01"}""");
        Assert.Equal(HttpStatusCode.Created, ok.StatusCode);
    }

    [Fact]
    public async Task Best_before_equal_to_purchase_date_is_allowed()
    {
        var r = await _app.Post("/items", """{"name":"a","location_id":1,"purchase_date":"2026-01-10","best_before":"2026-01-10"}""");
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
    }

    [Theory]
    [InlineData("""{"name":{"a":1},"location_id":1,"purchase_date":"2026-01-01"}""", "name")]
    [InlineData("""{"name":["x"],"location_id":1,"purchase_date":"2026-01-01"}""", "name")]
    [InlineData("""{"name":123,"location_id":1,"purchase_date":"2026-01-01"}""", "name")]
    [InlineData("""{"name":true,"location_id":1,"purchase_date":"2026-01-01"}""", "name")]
    [InlineData("""{"name":"a","location_id":"1","purchase_date":"2026-01-01"}""", "location_id")]
    [InlineData("""{"name":"a","location_id":{"x":1},"purchase_date":"2026-01-01"}""", "location_id")]
    [InlineData("""{"name":"a","location_id":1.5,"purchase_date":"2026-01-01"}""", "location_id")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":20260101}""", "purchase_date")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":["2026-01-01"]}""", "purchase_date")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01","best_before":5}""", "best_before")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01","category_id":"1"}""", "category_id")]
    [InlineData("""{"name":"a","location_id":1,"purchase_date":"2026-01-01","category_id":[1]}""", "category_id")]
    public async Task Wrongly_typed_values_are_rejected_and_never_stored(string json, string field)
    {
        var before = await _app.Scalar("SELECT count(*) FROM items");
        var errors = await TestApp.Errors(await _app.Post("/items", json));
        Assert.True(errors.ContainsKey(field));
        Assert.Equal(before, await _app.Scalar("SELECT count(*) FROM items"));
    }

    [Theory]
    [InlineData("{not json")]
    [InlineData("")]
    [InlineData("[]")]
    [InlineData("\"text\"")]
    public async Task Malformed_json_gives_400_message(string raw)
    {
        foreach (var r in new[] { await _app.Post("/items", raw), await _app.Put("/items/1", raw) })
        {
            Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
            Assert.Equal("The request body is not valid JSON.", (await TestApp.Body(r)).GetProperty("message").GetString());
        }
    }
}
