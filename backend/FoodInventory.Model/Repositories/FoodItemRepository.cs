using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class FoodItemRepository : BaseRepository
{
    // Every food item together with the name of its category and of its storage location.
    // "left join": a food item without a category is still in the result.
    private const string SelectFoodItems = @"
        select food_item.*, category.name as category_name, storage_location.name as storage_location_name
        from food_item
        left join category on category.id = food_item.category_id
        join storage_location on storage_location.id = food_item.storage_location_id";

    public FoodItemRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public FoodItem GetFoodItemById(int id)
    {
        // "using": the connection is closed again at the end of the method
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

    public List<FoodItem> GetFoodItems()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        // The food that expires first comes first; food without a best before date comes last.
        cmd.CommandText = SelectFoodItems + " order by food_item.best_before_date, food_item.name";
        var data = GetData(dbConn, cmd);
        var foodItems = new List<FoodItem>();
        while (data.Read())
        {
            foodItems.Add(ReadFoodItem(data));
        }
        return foodItems;
    }

    public bool InsertFoodItem(FoodItem foodItem)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            insert into food_item (name, quantity, purchase_date, best_before_date, category_id, storage_location_id)
            values (@name, @quantity, @purchase_date, @best_before_date, @category_id, @storage_location_id)";
        AddParameters(cmd, foodItem);
        return InsertData(dbConn, cmd);
    }

    public bool UpdateFoodItem(FoodItem foodItem)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            update food_item set
                name = @name,
                quantity = @quantity,
                purchase_date = @purchase_date,
                best_before_date = @best_before_date,
                category_id = @category_id,
                storage_location_id = @storage_location_id
            where id = @id";
        AddParameters(cmd, foodItem);
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, foodItem.Id);
        return UpdateData(dbConn, cmd);
    }

    public bool DeleteFoodItem(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "delete from food_item where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        return DeleteData(dbConn, cmd);
    }

    // Turns one row of the select into a FoodItem object.
    private static FoodItem ReadFoodItem(NpgsqlDataReader data)
    {
        var foodItem = new FoodItem((int)data["id"])
        {
            Name = (string)data["name"],
            Quantity = (int)data["quantity"],
            PurchaseDate = (DateOnly)data["purchase_date"], // Npgsql 10 reads a date column as DateOnly
            StorageLocationId = (int)data["storage_location_id"],
            StorageLocationName = (string)data["storage_location_name"]
        };
        // An empty (null) column in the database is DBNull.Value in C#.
        if (data["best_before_date"] != DBNull.Value)
        {
            foodItem.BestBeforeDate = (DateOnly)data["best_before_date"];
        }
        if (data["category_id"] != DBNull.Value)
        {
            foodItem.CategoryId = (int)data["category_id"];
            foodItem.CategoryName = (string)data["category_name"];
        }
        return foodItem;
    }

    // The values for the @parameters of the insert and the update.
    private static void AddParameters(NpgsqlCommand cmd, FoodItem foodItem)
    {
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, foodItem.Name);
        cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Integer, foodItem.Quantity);
        cmd.Parameters.AddWithValue("@purchase_date", NpgsqlDbType.Date, foodItem.PurchaseDate);
        // null in C# is sent to the database as DBNull.Value
        cmd.Parameters.AddWithValue("@best_before_date", NpgsqlDbType.Date, (object)foodItem.BestBeforeDate ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@category_id", NpgsqlDbType.Integer, (object)foodItem.CategoryId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@storage_location_id", NpgsqlDbType.Integer, foodItem.StorageLocationId);
    }
}
