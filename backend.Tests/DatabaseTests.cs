using System.Net;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using FoodInventory.Api.Data;

namespace FoodInventory.Api.Tests;

public class DatabaseTests : IClassFixture<TestApp>
{
    private readonly TestApp _app;
    public DatabaseTests(TestApp app) => _app = app;

    [Fact]
    public async Task Seed_has_3_locations_6_items_6_categories()
    {
        Assert.Equal(3, await _app.Scalar("SELECT count(*) FROM locations"));
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM items"));
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM categories"));
    }

    [Fact]
    public async Task Foreign_key_blocks_deleting_a_category_that_is_in_use()
    {
        var ex = await Assert.ThrowsAsync<PostgresException>(() =>
            _app.Scalar("WITH d AS (DELETE FROM categories WHERE name = 'Dairy' RETURNING 1) SELECT count(*) FROM d"));
        Assert.Equal("23503", ex.SqlState);
        Assert.Equal(6, await _app.Scalar("SELECT count(*) FROM categories"));
    }

    [Fact]
    public async Task Foreign_key_blocks_deleting_a_category_through_ef()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(_app.ConnectionString).Options;
        await using var db = new AppDbContext(options);
        var dairy = await db.Categories.FirstAsync(c => c.Name == "Dairy");
        db.Categories.Remove(dairy);
        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task Location_must_exist_for_an_item()
    {
        await Assert.ThrowsAsync<PostgresException>(() => _app.Scalar(
            "WITH i AS (INSERT INTO items (name, location_id, purchase_date) VALUES ('x', 99, CURRENT_DATE) RETURNING 1) SELECT count(*) FROM i"));
    }

    [Fact]
    public async Task Locations_endpoint_lists_the_three_fixed_locations()
    {
        var body = await TestApp.Body(await _app.Get("/locations"));
        Assert.Equal(new[] { "Fridge", "Freezer", "Pantry" }, body.EnumerateArray().Select(l => l.GetProperty("name").GetString()));
    }
}
