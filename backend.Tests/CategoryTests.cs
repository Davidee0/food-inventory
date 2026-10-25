using System.Net;
using System.Text.Json;

namespace FoodInventory.Api.Tests;

public class CategoryTests : IAsyncLifetime
{
    // Fresh seeded database per test, so tests never depend on each other.
    private readonly TestApp _app = new();
    public Task InitializeAsync() => ((IAsyncLifetime)_app).InitializeAsync();
    public Task DisposeAsync() => ((IAsyncLifetime)_app).DisposeAsync();

    private async Task<int> Create(string name)
    {
        var r = await _app.Post("/categories", JsonSerializer.Serialize(new { name }));
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await TestApp.Body(r)).GetProperty("id").GetInt32();
    }

    private static async Task<string> Message(HttpResponseMessage r) => (await TestApp.Body(r)).GetProperty("message").GetString()!;

    [Fact]
    public async Task List_is_ordered_by_name_with_item_counts()
    {
        var body = await TestApp.Body(await _app.Get("/categories"));
        var rows = body.EnumerateArray().Select(c => (c.GetProperty("name").GetString(), c.GetProperty("item_count").GetInt32())).ToArray();
        Assert.Equal(new (string?, int)[] { ("Dairy", 1), ("Drinks", 1), ("Fruit", 1), ("Meat and fish", 1), ("Other", 1), ("Vegetables", 1) }, rows);
    }

    [Fact]
    public async Task List_ignores_case_when_ordering_names()
    {
        foreach (var name in new[] { "banana", "Apple", "cherry" }) await Create(name);
        var body = await TestApp.Body(await _app.Get("/categories"));
        var names = body.EnumerateArray().Select(c => c.GetProperty("name").GetString()).ToArray();
        Assert.Equal(new[] { "Apple", "banana", "cherry", "Dairy", "Drinks", "Fruit", "Meat and fish", "Other", "Vegetables" }, names);
    }

    [Fact]
    public async Task Create_returns_201_with_zero_count_and_trims()
    {
        var r = await _app.Post("/categories", """{"name":"  Snacks  "}""");
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        var b = await TestApp.Body(r);
        Assert.Equal("Snacks", b.GetProperty("name").GetString());
        Assert.Equal(0, b.GetProperty("item_count").GetInt32());
    }

    [Theory]
    [InlineData("""{}""", "Enter a name.")]
    [InlineData("""{"name":"   "}""", "Enter a name.")]
    [InlineData("""{"name":42}""", "Enter a name.")]
    [InlineData("""{"name":{"a":1}}""", "Enter a name.")]
    [InlineData("""{"name":["a"]}""", "Enter a name.")]
    [InlineData("""{"name":"0123456789012345678901234567890"}""", "Name can be at most 30 characters.")]
    public async Task Invalid_category_name_gives_400(string json, string message)
    {
        var before = await _app.Scalar("SELECT count(*) FROM categories");
        Assert.Equal(message, (await TestApp.Errors(await _app.Post("/categories", json)))["name"]);
        Assert.Equal(message, (await TestApp.Errors(await _app.Put("/categories/1", json)))["name"]);
        Assert.Equal(before, await _app.Scalar("SELECT count(*) FROM categories"));
    }

    [Fact]
    public async Task Malformed_json_gives_400()
    {
        var r = await _app.Post("/categories", "{oops");
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        Assert.Equal("The request body is not valid JSON.", await Message(r));
    }

    [Theory]
    [InlineData("Dairy", "Dairy")]
    [InlineData("dairy", "dairy")]
    [InlineData("DAIRY", "DAIRY")]
    public async Task Duplicate_names_are_409_ignoring_case(string name, string shown)
    {
        var r = await _app.Post("/categories", JsonSerializer.Serialize(new { name }));
        Assert.Equal(HttpStatusCode.Conflict, r.StatusCode);
        Assert.Equal($"{shown} already exists.", await Message(r));
    }

    [Fact]
    public async Task Duplicate_check_handles_AE_O_A_letters()
    {
        await Create("Æbler");
        var r = await _app.Post("/categories", """{"name":"æbler"}""");
        Assert.Equal(HttpStatusCode.Conflict, r.StatusCode);
        Assert.Equal("æbler already exists.", await Message(r));
        await Create("Østers");
        Assert.Equal(HttpStatusCode.Conflict, (await _app.Post("/categories", """{"name":"østers"}""")).StatusCode);
        await Create("Ålegræs");
        Assert.Equal(HttpStatusCode.Conflict, (await _app.Post("/categories", """{"name":"ÅLEGRÆS"}""")).StatusCode);
    }

    [Fact]
    public async Task Rename_works_and_conflicts_with_other_names_but_not_itself()
    {
        var id = await Create("Sweets");
        var ok = await _app.Put($"/categories/{id}", """{"name":"Candy"}""");
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        var b = await TestApp.Body(ok);
        Assert.Equal("Candy", b.GetProperty("name").GetString());
        Assert.Equal(id, b.GetProperty("id").GetInt32());
        Assert.False(b.TryGetProperty("item_count", out _));

        Assert.Equal(HttpStatusCode.OK, (await _app.Put($"/categories/{id}", """{"name":"CANDY"}""")).StatusCode);
        var dup = await _app.Put($"/categories/{id}", """{"name":"dairy"}""");
        Assert.Equal(HttpStatusCode.Conflict, dup.StatusCode);
        Assert.Equal("dairy already exists.", await Message(dup));
    }

    [Fact]
    public async Task Unknown_deleted_or_non_numeric_ids_give_404()
    {
        var id = await Create("Temp");
        Assert.Equal(HttpStatusCode.NoContent, (await _app.Delete($"/categories/{id}")).StatusCode);
        foreach (var path in new[] { $"/categories/{id}", "/categories/abc" })
            foreach (var method in new[] { HttpMethod.Put, HttpMethod.Delete })
            {
                var r = await _app.Send(method, path, method == HttpMethod.Put ? """{"name":"x"}""" : null);
                Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
                Assert.Equal("Category not found.", await Message(r));
            }
    }

    [Fact]
    public async Task Deleting_a_used_category_is_409_with_count()
    {
        var one = await _app.Delete("/categories/1");
        Assert.Equal(HttpStatusCode.Conflict, one.StatusCode);
        var b = await TestApp.Body(one);
        Assert.Equal("Dairy is used by 1 item and cannot be deleted.", b.GetProperty("message").GetString());
        Assert.Equal(1, b.GetProperty("itemCount").GetInt32());

        await _app.Post("/items", """{"name":"Yoghurt","location_id":1,"category_id":1,"purchase_date":"2026-01-01"}""");
        var two = await TestApp.Body(await _app.Delete("/categories/1"));
        Assert.Equal("Dairy is used by 2 items and cannot be deleted.", two.GetProperty("message").GetString());
        Assert.Equal(2, two.GetProperty("itemCount").GetInt32());
    }

    [Fact]
    public async Task Deleting_the_items_frees_the_category_and_items_do_not_reappear()
    {
        var items = await TestApp.Body(await _app.Get("/items"));
        foreach (var i in items.EnumerateArray()) await _app.Delete($"/items/{i.GetProperty("id").GetInt32()}");
        Assert.Equal(0, (await TestApp.Body(await _app.Get("/items"))).GetArrayLength());
        Assert.Equal(HttpStatusCode.NoContent, (await _app.Delete("/categories/1")).StatusCode);
    }
}
