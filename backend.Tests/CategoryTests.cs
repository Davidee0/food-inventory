using System.Net;
using System.Text.Json;

namespace FoodInventory.Api.Tests;

public class CategoryTests : ApiTest
{
    [Fact]
    public async Task The_list_has_item_counts_and_is_ordered_by_name_ignoring_case()
    {
        await Api("POST", "/categories", new { name = "apples" });
        var list = (await Api("GET", "/categories")).Body.EnumerateArray()
            .Select(c => (Text(c, "name"), c.GetProperty("item_count").GetInt32()));
        Assert.Equal([("apples", 0), ("Dairy", 1), ("Drinks", 1), ("Fruit", 1), ("Meat and fish", 1), ("Other", 1), ("Vegetables", 1)], list);
    }

    [Fact]
    public async Task Names_are_unique_ignoring_case_and_rename_and_delete_work()
    {
        var created = await Api("POST", "/categories", new { name = " Æbler " });
        Assert.Equal(HttpStatusCode.Created, created.Status);
        Assert.Equal(("Æbler", 0), (Text(created.Body, "name"), created.Body.GetProperty("item_count").GetInt32()));
        var id = created.Body.GetProperty("id").GetInt32();

        // including Danish letters
        foreach (var name in new[] { "æbler", "dairy", "DAIRY" })
        {
            var duplicate = await Api("POST", "/categories", new { name });
            Assert.Equal(HttpStatusCode.Conflict, duplicate.Status);
            Assert.Equal($"{name} already exists.", Text(duplicate.Body, "message"));
        }
        Assert.Equal("Enter a name.", Text((await Api("POST", "/categories", new { name = "  " })).Body.GetProperty("errors"), "name"));
        Assert.Equal("Name can be at most 30 characters.",
            Text((await Api("POST", "/categories", new { name = new string('x', 31) })).Body.GetProperty("errors"), "name"));

        var renamed = await Api("PUT", $"/categories/{id}", new { name = "Apples" });
        Assert.Equal(HttpStatusCode.OK, renamed.Status);
        Assert.Equal(["id", "name"], renamed.Body.EnumerateObject().Select(p => p.Name));
        Assert.Equal(HttpStatusCode.Conflict, (await Api("PUT", $"/categories/{id}", new { name = "DAIRY" })).Status);
        Assert.Equal(HttpStatusCode.OK, (await Api("PUT", $"/categories/{id}", new { name = "APPLES" })).Status); // its own name
        Assert.Equal("Enter a name.", Text((await Api("PUT", $"/categories/{id}", new { name = "" })).Body.GetProperty("errors"), "name"));

        Assert.Equal(HttpStatusCode.NoContent, (await Api("DELETE", $"/categories/{id}")).Status);
        foreach (var (method, path) in new[] { ("DELETE", $"/categories/{id}"), ("PUT", "/categories/9999"), ("PUT", "/categories/abc") })
        {
            var gone = await Api(method, path, method == "PUT" ? new { name = "Nope" } : null);
            Assert.Equal(HttpStatusCode.NotFound, gone.Status);
            Assert.Equal("Category not found.", Text(gone.Body, "message"));
        }
    }

    [Fact]
    public async Task A_category_in_use_cannot_be_deleted_and_the_message_gives_the_item_count()
    {
        var one = await Api("DELETE", "/categories/1");
        Assert.Equal(HttpStatusCode.Conflict, one.Status);
        Assert.Equal(("Dairy is used by 1 item and cannot be deleted.", 1), (Text(one.Body, "message"), one.Body.GetProperty("itemCount").GetInt32()));

        await Api("POST", "/items", Good(("category_id", 1)));
        var two = (await Api("DELETE", "/categories/1")).Body;
        Assert.Equal(("Dairy is used by 2 items and cannot be deleted.", 2), (Text(two, "message"), two.GetProperty("itemCount").GetInt32()));
    }
}
