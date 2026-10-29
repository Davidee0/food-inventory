using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class ItemRepository : BaseRepository
{
    // Each item with the names of its location and category.
    private const string SelectItems = @"
        select item.*, location.name as location_name, category.name as category_name
        from item
        join location on location.id = item.location_id
        left join category on category.id = item.category_id";

    public ItemRepository(IConfiguration configuration) : base(configuration) { }

    public Item? GetItemById(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = SelectItems + " where item.id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        var data = GetData(dbConn, cmd);
        return data.Read() ? ReadItem(data) : null;
    }

    // Soonest best before date first; items without one come last.
    public List<Item> GetItems()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = SelectItems + " order by item.best_before, item.name";
        var data = GetData(dbConn, cmd);
        var items = new List<Item>();
        while (data.Read())
        {
            items.Add(ReadItem(data));
        }
        return items;
    }

    public bool InsertItem(Item i)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            insert into item (name, location_id, category_id, purchase_date, best_before)
            values (@name, @location_id, @category_id, @purchase_date, @best_before)";
        AddParameters(cmd, i);
        return InsertData(dbConn, cmd);
    }

    public bool UpdateItem(Item i)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            update item set name = @name, location_id = @location_id, category_id = @category_id,
                purchase_date = @purchase_date, best_before = @best_before
            where id = @id";
        AddParameters(cmd, i);
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, i.Id);
        return UpdateData(dbConn, cmd);
    }

    public bool DeleteItem(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "delete from item where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        return DeleteData(dbConn, cmd);
    }

    private static Item ReadItem(NpgsqlDataReader data) => new((int)data["id"])
    {
        Name = (string)data["name"],
        LocationId = (int)data["location_id"],
        CategoryId = data["category_id"] as int?,
        PurchaseDate = DateOnly.FromDateTime((DateTime)data["purchase_date"]),
        BestBefore = data["best_before"] is DateTime bestBefore ? DateOnly.FromDateTime(bestBefore) : null,
        LocationName = (string)data["location_name"],
        CategoryName = data["category_name"] as string,
    };

    private static void AddParameters(NpgsqlCommand cmd, Item i)
    {
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, i.Name);
        cmd.Parameters.AddWithValue("@location_id", NpgsqlDbType.Integer, i.LocationId);
        cmd.Parameters.AddWithValue("@category_id", NpgsqlDbType.Integer, (object?)i.CategoryId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@purchase_date", NpgsqlDbType.Date, i.PurchaseDate);
        cmd.Parameters.AddWithValue("@best_before", NpgsqlDbType.Date, (object?)i.BestBefore ?? DBNull.Value);
    }
}
