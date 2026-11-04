using System.Net;
using System.Text.Json;

namespace FoodInventory.Tests;

public class CategoryTests : ApiTest
{
    [Fact]
    public async Task The_list_has_item_counts_and_is_ordered_by_name_ignoring_case()
    {
        await Api("POST", "/api/Category", new { name = "apples" });
        var list = (await Api("GET", "/api/Category")).Body.EnumerateArray()
            .Select(c => (Text(c, "name"), c.GetProperty("itemCount").GetInt32()));
        Assert.Equal([("apples", 0), ("Dairy", 1), ("Drinks", 1), ("Fruit", 1), ("Meat and fish", 1), ("Other", 1), ("Vegetables", 1)], list);
    }

    [Fact]
    public async Task Names_are_unique_ignoring_case_and_rename_and_delete_work()
    {
        var created = await Api("POST", "/api/Category", new { name = " Æbler " });
        Assert.Equal(HttpStatusCode.Created, created.Status);
        Assert.Equal(("Æbler", 0), (Text(created.Body, "name"), created.Body.GetProperty("itemCount").GetInt32()));
        var id = created.Body.GetProperty("id").GetInt32();

        // including Danish letters
        foreach (var name in new[] { "æbler", "dairy", "DAIRY" })
        {
            var duplicate = await Api("POST", "/api/Category", new { name });
            Assert.Equal(HttpStatusCode.Conflict, duplicate.Status);
            Assert.Equal($"{name} already exists.", Text(duplicate.Body, "message"));
        }
        Assert.Equal("Enter a name.", Text((await Api("POST", "/api/Category", new { name = "  " })).Body.GetProperty("errors"), "name"));
        Assert.Equal("Name can be at most 30 characters.",
            Text((await Api("POST", "/api/Category", new { name = new string('x', 31) })).Body.GetProperty("errors"), "name"));

        var renamed = await Api("PUT", $"/api/Category/{id}", new { name = "Apples" });
        Assert.Equal(HttpStatusCode.OK, renamed.Status);
        Assert.Equal(["id", "name", "itemCount"], renamed.Body.EnumerateObject().Select(p => p.Name));
        Assert.Equal(HttpStatusCode.Conflict, (await Api("PUT", $"/api/Category/{id}", new { name = "DAIRY" })).Status);
        Assert.Equal(HttpStatusCode.OK, (await Api("PUT", $"/api/Category/{id}", new { name = "APPLES" })).Status); // its own name
        Assert.Equal("Enter a name.", Text((await Api("PUT", $"/api/Category/{id}", new { name = "" })).Body.GetProperty("errors"), "name"));

        Assert.Equal(HttpStatusCode.NoContent, (await Api("DELETE", $"/api/Category/{id}")).Status);
        foreach (var (method, path) in new[] { ("DELETE", $"/api/Category/{id}"), ("PUT", "/api/Category/9999"), ("PUT", "/api/Category/abc") })
        {
            var gone = await Api(method, path, method == "PUT" ? new { name = "Nope" } : null);
            Assert.Equal(HttpStatusCode.NotFound, gone.Status);
            Assert.Equal("Category not found.", Text(gone.Body, "message"));
        }
    }

    [Fact]
    public async Task A_category_in_use_cannot_be_deleted_and_the_message_gives_the_item_count()
    {
        var one = await Api("DELETE", "/api/Category/1");
        Assert.Equal(HttpStatusCode.Conflict, one.Status);
        Assert.Equal(("Dairy is used by 1 item and cannot be deleted.", 1), (Text(one.Body, "message"), one.Body.GetProperty("itemCount").GetInt32()));

        await Api("POST", "/api/Item", Good(("categoryId", 1)));
        var two = (await Api("DELETE", "/api/Category/1")).Body;
        Assert.Equal(("Dairy is used by 2 items and cannot be deleted.", 2), (Text(two, "message"), two.GetProperty("itemCount").GetInt32()));
    }
}
