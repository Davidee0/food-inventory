using System.Net;
using Npgsql;

namespace FoodInventory.Api.Tests;

public class DatabaseTests : ApiTest
{
    [Fact]
    public async Task Foreign_keys_are_enforced_by_the_database()
    {
        var error = await Assert.ThrowsAsync<PostgresException>(() => Sql("DELETE FROM categories WHERE name = 'Dairy'"));
        Assert.Equal(PostgresErrorCodes.ForeignKeyViolation, error.SqlState);
    }

    [Fact]
    public async Task Seed_has_3_locations_and_6_items_soonest_best_before_first_ties_by_name()
    {
        var locations = (await Api("GET", "/locations")).Body.EnumerateArray().Select(l => l.GetProperty("name").GetString());
        Assert.Equal(["Fridge", "Freezer", "Pantry"], locations);

        var items = (await Api("GET", "/items")).Body.EnumerateArray().Select(i => i.GetProperty("name").GetString());
        Assert.Equal(["Chicken breast", "Milk", "Orange juice", "Frozen peas", "Frozen berries", "Pasta"], items);

        // Bought N days ago, best before in N days: the dates are computed by PostgreSQL from today.
        Assert.Equal(6, await Count("""
            SELECT count(*) FROM items i JOIN (VALUES ('Milk', 3, 2), ('Chicken breast', 4, -1), ('Frozen peas', 20, 120),
                ('Frozen berries', 10, 200), ('Pasta', 15, NULL), ('Orange juice', 5, 30)) AS v(name, bought, until) ON v.name = i.name
            WHERE i.purchase_date = CURRENT_DATE - v.bought AND i.best_before IS NOT DISTINCT FROM CURRENT_DATE + v.until
            """));

        var when = AddDays(40);
        await Api("POST", "/items", Good(("name", "beta"), ("best_before", when)));
        await Api("POST", "/items", Good(("name", "Alpha"), ("best_before", when)));
        var tied = (await Api("GET", "/items")).Body.EnumerateArray()
            .Where(i => i.GetProperty("best_before").GetString() == when).Select(i => i.GetProperty("name").GetString());
        Assert.Equal(["Alpha", "beta"], tied);
    }

    [Fact]
    public async Task The_seed_only_runs_on_an_empty_database_so_deleted_items_never_come_back()
    {
        foreach (var item in (await Api("GET", "/items")).Body.EnumerateArray())
            Assert.Equal(HttpStatusCode.NoContent, (await Api("DELETE", $"/items/{item.GetProperty("id")}")).Status);

        await Assert.ThrowsAsync<PostgresException>(() => RunScript("seed_data.sql"));
        Assert.Equal(0, await Count("SELECT count(*) FROM items"));
    }
}
