using System.Net;
using System.Text.Json;

namespace FoodInventory.Tests;

public class ItemTests : ApiTest
{
    [Fact]
    public async Task Create_read_replace_and_delete_an_item()
    {
        var created = await Api("POST", "/api/Item", Good(("name", "  Cheese  "), ("bestBefore", AddDays(5))));
        Assert.Equal(HttpStatusCode.Created, created.Status);
        Assert.Equal(["id", "name", "locationId", "categoryId", "purchaseDate", "bestBefore", "locationName", "categoryName"],
            created.Body.EnumerateObject().Select(p => p.Name));
        Assert.Equal(("Cheese", "Fridge", AddDays(5)), (Text(created.Body, "name"), Text(created.Body, "locationName"), Text(created.Body, "bestBefore")));
        var id = created.Body.GetProperty("id").GetInt32();

        Assert.Equal("Cheese", Text((await Api("GET", $"/api/Item/{id}")).Body, "name"));

        var replaced = await Api("PUT", $"/api/Item/{id}", Good(("name", "Butter"), ("locationId", 3), ("categoryId", 1)));
        Assert.Equal(HttpStatusCode.OK, replaced.Status);
        Assert.Equal(("Butter", "Pantry", "Dairy"), (Text(replaced.Body, "name"), Text(replaced.Body, "locationName"), Text(replaced.Body, "categoryName")));
        Assert.Equal(JsonValueKind.Null, replaced.Body.GetProperty("bestBefore").ValueKind);

        Assert.Equal(HttpStatusCode.NoContent, (await Api("DELETE", $"/api/Item/{id}")).Status);
        foreach (var (method, path) in new[] { ("GET", $"/api/Item/{id}"), ("DELETE", $"/api/Item/{id}"), ("PUT", $"/api/Item/{id}"), ("GET", "/api/Item/abc") })
        {
            var gone = await Api(method, path, method == "PUT" ? Good() : null);
            Assert.Equal(HttpStatusCode.NotFound, gone.Status);
            Assert.Equal("Item not found.", Text(gone.Body, "message"));
        }
    }

    [Fact]
    public async Task An_empty_item_gets_one_message_per_required_field()
    {
        var response = await Api("POST", "/api/Item", new { });
        Assert.Equal(HttpStatusCode.BadRequest, response.Status);
        Assert.Equal(new Dictionary<string, string>
        {
            ["name"] = "Enter a name.",
            ["locationId"] = "Choose a storage location.",
            ["purchaseDate"] = "Enter a purchase date.",
        }, response.Body.GetProperty("errors").Deserialize<Dictionary<string, string>>());
    }

    public static TheoryData<string, object?, string> BadValues => new()
    {
        { "name", "   ", "Enter a name." },
        { "name", "a\0b", "Enter a name." },
        { "name", new string('x', 51), "Name can be at most 50 characters." },
        { "locationId", null, "Choose a storage location." },
        { "locationId", 99, "Choose a storage location." },
        { "categoryId", 99, "Choose a category from the list." },
        { "purchaseDate", "", "Enter a purchase date." },
        { "purchaseDate", "2026-02-30", "Enter a valid date." },
        { "purchaseDate", "13-10-2026", "Enter a valid date." },
        { "purchaseDate", "2026-10-13T10:00:00Z", "Enter a valid date." },
        { "bestBefore", "2026-02-30", "Enter a valid date." },
        { "bestBefore", AddDays(-1), "Best before date cannot be before the purchase date." },
    };

    [Theory, MemberData(nameof(BadValues))]
    public async Task Bad_item_data_gets_400_with_the_message_on_its_field(string field, object? value, string message)
    {
        foreach (var (method, path) in new[] { ("POST", "/api/Item"), ("PUT", "/api/Item/1") })
        {
            var response = await Api(method, path, Good((field, value)));
            Assert.Equal(HttpStatusCode.BadRequest, response.Status);
            Assert.Equal(message, Text(response.Body.GetProperty("errors"), field));
        }
    }

    [Fact]
    public async Task Names_are_trimmed_and_may_have_50_characters_and_best_before_may_equal_the_purchase_date()
    {
        var response = await Api("POST", "/api/Item", Good(("name", $"  {new string('x', 50)}  "), ("bestBefore", Today)));
        Assert.Equal(HttpStatusCode.Created, response.Status);
        Assert.Equal(new string('x', 50), Text(response.Body, "name"));
    }

    [Fact]
    public async Task Ids_may_be_sent_as_numbers_or_as_text()
    {
        var response = await Api("POST", "/api/Item", Good(("locationId", "2"), ("categoryId", "1")));
        Assert.Equal(HttpStatusCode.Created, response.Status);
        Assert.Equal(("Freezer", "Dairy"), (Text(response.Body, "locationName"), Text(response.Body, "categoryName")));
    }

    [Theory]
    [InlineData("""{"name": """)]
    [InlineData("[]")]
    [InlineData("")]
    public async Task Malformed_json_gets_400_with_a_message(string raw)
    {
        foreach (var (method, path) in new[] { ("POST", "/api/Item"), ("PUT", "/api/Item/1"), ("POST", "/api/Category") })
        {
            var response = await Api(method, path, raw);
            Assert.Equal(HttpStatusCode.BadRequest, response.Status);
            Assert.Equal("The request body is not valid JSON.", Text(response.Body, "message"));
        }
    }

    [Fact]
    public async Task Wrongly_typed_values_are_rejected_and_never_stored()
    {
        var items = new (string, object)[]
        {
            ("name", new { a = 1 }), ("name", 123), ("locationId", new[] { 1 }), ("categoryId", new[] { 1 }),
            ("purchaseDate", new[] { "2026-01-01" }), ("bestBefore", new { }),
        };
        foreach (var change in items)
            Assert.Equal(HttpStatusCode.BadRequest, (await Api("POST", "/api/Item", Good(change))).Status);
        foreach (var name in new object[] { new { a = 1 }, 5, new[] { "x" } })
            Assert.Equal(HttpStatusCode.BadRequest, (await Api("POST", "/api/Category", new { name })).Status);

        Assert.Equal(6, await Count("SELECT count(*) FROM items"));
        Assert.Equal(6, await Count("SELECT count(*) FROM categories"));
    }
}
