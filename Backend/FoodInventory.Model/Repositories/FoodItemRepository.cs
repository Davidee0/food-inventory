using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class FoodItemRepository : BaseRepository
{
    // Each food item with the names of its category and storage location.
    // left join: food without a category is still in the result.
    private const string SelectFoodItems = @"
        select food_item.*, category.name as category_name, storage_location.name as storage_location_name
        from food_item
        left join category on category.id = food_item.category_id
        join storage_location on storage_location.id = food_item.storage_location_id";

    public FoodItemRepository(IConfiguration configuration) : base(configuration) { }

    public virtual FoodItem GetFoodItemById(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = SelectFoodItems + " where food_item.id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        var data = GetData(dbConn, cmd);
        if (data.Read())
        {
            return ReadFoodItem(data);
        }
        return null;
    }

    // US12: soonest best before date first. PostgreSQL puts empty (null) dates last when sorting ascending.
    public virtual List<FoodItem> GetFoodItems()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = SelectFoodItems + " order by food_item.best_before_date, food_item.name";
        var data = GetData(dbConn, cmd);
        var foodItems = new List<FoodItem>();
        while (data.Read())
        {
            foodItems.Add(ReadFoodItem(data));
        }
        return foodItems;
    }

    public virtual bool InsertFoodItem(FoodItem f)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            insert into food_item (name, quantity, purchase_date, best_before_date, category_id, storage_location_id)
            values (@name, @quantity, @purchase_date, @best_before_date, @category_id, @storage_location_id)";
        AddParameters(cmd, f);
        return InsertData(dbConn, cmd);
    }

    public virtual bool UpdateFoodItem(FoodItem f)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            update food_item set name = @name, quantity = @quantity, purchase_date = @purchase_date,
                best_before_date = @best_before_date, category_id = @category_id,
                storage_location_id = @storage_location_id
            where id = @id";
        AddParameters(cmd, f);
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, f.Id);
        return UpdateData(dbConn, cmd);
    }

    public virtual bool DeleteFoodItem(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "delete from food_item where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        return DeleteData(dbConn, cmd);
    }

    // One row of the result becomes one FoodItem. Npgsql reads a date column as DateOnly; empty columns are DBNull.
    private FoodItem ReadFoodItem(NpgsqlDataReader data)
    {
        return new FoodItem((int)data["id"])
        {
            Name = (string)data["name"],
            Quantity = (int)data["quantity"],
            PurchaseDate = (DateOnly)data["purchase_date"],
            BestBeforeDate = data["best_before_date"] as DateOnly?,
            CategoryId = data["category_id"] as int?,
            StorageLocationId = (int)data["storage_location_id"],
            CategoryName = data["category_name"] as string,
            StorageLocationName = (string)data["storage_location_name"]
        };
    }

    // The same six parameters for insert and update. @parameters keep typed text out of the SQL (no SQL injection).
    private void AddParameters(NpgsqlCommand cmd, FoodItem f)
    {
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, f.Name);
        cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Integer, f.Quantity);
        cmd.Parameters.AddWithValue("@purchase_date", NpgsqlDbType.Date, f.PurchaseDate);
        cmd.Parameters.AddWithValue("@best_before_date", NpgsqlDbType.Date, (object)f.BestBeforeDate ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@category_id", NpgsqlDbType.Integer, (object)f.CategoryId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@storage_location_id", NpgsqlDbType.Integer, f.StorageLocationId);
    }
}
