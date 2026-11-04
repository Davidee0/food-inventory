namespace FoodInventory.Model.Repositories;

using System.Data;
using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;

public class ItemRepository(IConfiguration configuration) : BaseRepository(configuration)
{
    // The items with the names of their location and category (LEFT JOIN: the category is optional).
    private const string Select = """
        SELECT i.id, i.name, i.location_id, i.category_id, i.purchase_date, i.best_before,
               l.name AS location_name, c.name AS category_name
        FROM items i
        JOIN locations l ON l.id = i.location_id
        LEFT JOIN categories c ON c.id = i.category_id
        """;

    // Soonest best before date first, items without a date last, ties by name ignoring case.
    public List<Item> GetItems()
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = Select + " ORDER BY i.best_before NULLS LAST, lower(i.name), i.id";
        using var data = GetData(conn, cmd);
        return ReadItems(data);
    }

    public Item GetItemById(int id)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = Select + " WHERE i.id = @id";
        cmd.Parameters.AddWithValue("@id", id);
        using var data = GetData(conn, cmd);
        return ReadItems(data).FirstOrDefault();
    }

    // Returns the new id: RETURNING gives it back like a query.
    public int InsertItem(Item item)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = """
            INSERT INTO items (name, location_id, category_id, purchase_date, best_before)
            VALUES (@name, @location_id, @category_id, @purchase_date, @best_before) RETURNING id
            """;
        AddParameters(cmd, item);
        using var data = GetData(conn, cmd);
        data.Read();
        return data.GetInt32("id");
    }

    public bool UpdateItem(Item item)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = """
            UPDATE items SET name = @name, location_id = @location_id, category_id = @category_id,
                purchase_date = @purchase_date, best_before = @best_before
            WHERE id = @id
            """;
        AddParameters(cmd, item);
        cmd.Parameters.AddWithValue("@id", item.Id);
        return UpdateData(conn, cmd);
    }

    public bool DeleteItem(int id)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM items WHERE id = @id";
        cmd.Parameters.AddWithValue("@id", id);
        return DeleteData(conn, cmd);
    }

    // A missing category or best before date is stored as NULL.
    private static void AddParameters(NpgsqlCommand cmd, Item item)
    {
        cmd.Parameters.AddWithValue("@name", item.Name);
        cmd.Parameters.AddWithValue("@location_id", item.LocationId);
        cmd.Parameters.AddWithValue("@category_id", (object)item.CategoryId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@purchase_date", item.PurchaseDate);
        cmd.Parameters.AddWithValue("@best_before", (object)item.BestBefore ?? DBNull.Value);
    }

    private static List<Item> ReadItems(NpgsqlDataReader data)
    {
        var items = new List<Item>();
        while (data.Read())
            items.Add(new Item(data.GetInt32("id"))
            {
                Name = data.GetString("name"),
                LocationId = data.GetInt32("location_id"),
                CategoryId = data.GetFieldValue<int?>("category_id"),
                PurchaseDate = data.GetFieldValue<DateOnly>("purchase_date"),
                BestBefore = data.GetFieldValue<DateOnly?>("best_before"),
                LocationName = data.GetString("location_name"),
                CategoryName = data["category_name"] as string,
            });
        return items;
    }
}
