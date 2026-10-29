using System.Net;

namespace FoodInventory.Api.Tests;

public class LocationTests : ApiTest
{
    [Fact]
    public async Task The_list_has_item_counts_in_id_order()
    {
        var list = (await Api("GET", "/locations")).Body.EnumerateArray()
            .Select(l => (Text(l, "name"), l.GetProperty("item_count").GetInt32()));
        Assert.Equal([("Fridge", 2), ("Freezer", 2), ("Pantry", 2)], list);
    }

    [Fact]
    public async Task Names_are_unique_ignoring_case_and_rename_and_delete_work()
    {
        var created = await Api("POST", "/locations", new { name = " Cellar " });
        Assert.Equal(HttpStatusCode.Created, created.Status);
        Assert.Equal(("Cellar", 0), (Text(created.Body, "name"), created.Body.GetProperty("item_count").GetInt32()));
        var id = created.Body.GetProperty("id").GetInt32();

        foreach (var name in new[] { "cellar", "FRIDGE" })
        {
            var duplicate = await Api("POST", "/locations", new { name });
            Assert.Equal(HttpStatusCode.Conflict, duplicate.Status);
            Assert.Equal($"{name} already exists.", Text(duplicate.Body, "message"));
        }
        Assert.Equal("Enter a name.", Text((await Api("POST", "/locations", new { name = "  " })).Body.GetProperty("errors"), "name"));
        Assert.Equal("Name can be at most 30 characters.",
            Text((await Api("POST", "/locations", new { name = new string('x', 31) })).Body.GetProperty("errors"), "name"));

        Assert.Equal(HttpStatusCode.OK, (await Api("PUT", $"/locations/{id}", new { name = "Basement" })).Status);
        Assert.Equal(HttpStatusCode.Conflict, (await Api("PUT", $"/locations/{id}", new { name = "pantry" })).Status);
        Assert.Equal(HttpStatusCode.OK, (await Api("PUT", $"/locations/{id}", new { name = "BASEMENT" })).Status); // its own name

        Assert.Equal(HttpStatusCode.NoContent, (await Api("DELETE", $"/locations/{id}")).Status);
        foreach (var (method, path) in new[] { ("DELETE", $"/locations/{id}"), ("PUT", "/locations/9999"), ("PUT", "/locations/abc") })
        {
            var gone = await Api(method, path, method == "PUT" ? new { name = "Nope" } : null);
            Assert.Equal(HttpStatusCode.NotFound, gone.Status);
            Assert.Equal("Location not found.", Text(gone.Body, "message"));
        }
    }

    [Fact]
    public async Task A_location_with_items_cannot_be_deleted_and_the_message_gives_the_item_count()
    {
        var answer = await Api("DELETE", "/locations/1");
        Assert.Equal(HttpStatusCode.Conflict, answer.Status);
        Assert.Equal(("Fridge holds 2 items and cannot be deleted.", 2), (Text(answer.Body, "message"), answer.Body.GetProperty("itemCount").GetInt32()));
    }
}
