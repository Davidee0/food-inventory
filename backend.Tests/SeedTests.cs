using Npgsql;

namespace FoodInventory.Api.Tests;

/// <summary>The seed runs once on a brand-new database and never brings anything back.</summary>
public class SeedTests : IAsyncLifetime
{
    private readonly TestApp _app = new();
    public Task InitializeAsync() => ((IAsyncLifetime)_app).InitializeAsync();
    public Task DisposeAsync() => ((IAsyncLifetime)_app).DisposeAsync();

    private async Task AssertCounts(int locations, int categories, int items)
    {
        Assert.Equal(locations, await _app.Scalar("SELECT count(*) FROM locations"));
        Assert.Equal(categories, await _app.Scalar("SELECT count(*) FROM categories"));
        Assert.Equal(items, await _app.Scalar("SELECT count(*) FROM items"));
    }

    [Fact]
    public async Task Seed_data_has_the_expected_dates_relative_to_today()
    {
        // name, bought N days ago, best before in N days (null = none)
        var expected = new (string Name, int Bought, int? BestBefore)[]
        {
            ("Milk", 3, 2), ("Chicken breast", 4, -1), ("Frozen peas", 20, 120),
            ("Frozen berries", 10, 200), ("Pasta", 15, null), ("Orange juice", 5, 30),
        };
        foreach (var (name, bought, bestBefore) in expected)
        {
            Assert.Equal(1, await _app.Scalar($"SELECT count(*) FROM items WHERE name = '{name}' AND purchase_date = CURRENT_DATE - {bought}"));
            Assert.Equal(1, await _app.Scalar(bestBefore is null
                ? $"SELECT count(*) FROM items WHERE name = '{name}' AND best_before IS NULL"
                : $"SELECT count(*) FROM items WHERE name = '{name}' AND best_before = CURRENT_DATE + {bestBefore}"));
        }
        Assert.Equal(1, await _app.Scalar(
            "SELECT count(*) FROM items i JOIN locations l ON l.id = i.location_id JOIN categories c ON c.id = i.category_id " +
            "WHERE i.name = 'Chicken breast' AND l.name = 'Fridge' AND c.name = 'Meat and fish'"));
    }

    [Fact]
    public async Task Running_the_seed_again_is_refused_and_changes_nothing()
    {
        var ex = await Assert.ThrowsAsync<PostgresException>(() => _app.RunScript("seed_data.sql"));
        Assert.Contains("brand-new", ex.MessageText);
        await AssertCounts(3, 6, 6);
    }

    [Fact]
    public async Task Deleting_every_item_and_seeding_again_does_not_bring_them_back()
    {
        var items = await TestApp.Body(await _app.Get("/items"));
        foreach (var i in items.EnumerateArray()) await _app.Delete($"/items/{i.GetProperty("id").GetInt32()}");
        await Assert.ThrowsAsync<PostgresException>(() => _app.RunScript("seed_data.sql"));
        await AssertCounts(3, 6, 0);
        Assert.Equal(0, (await TestApp.Body(await _app.Get("/items"))).GetArrayLength());
    }
}
