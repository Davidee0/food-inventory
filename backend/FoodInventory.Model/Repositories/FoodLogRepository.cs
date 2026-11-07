using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class FoodLogRepository : BaseRepository
{
    // Every row of the history together with the name of its category.
    // "left join": a row without a category is still in the result.
    private const string SelectFoodLogs = @"
        select food_log.*, category.name as category_name
        from food_log
        left join category on category.id = food_log.category_id";

    public FoodLogRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public FoodLog GetFoodLogById(int id)
    {
        // "using": the connection is closed again at the end of the method
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = SelectFoodLogs + " where food_log.id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        var data = GetData(dbConn, cmd);
        if (data.Read())
        {
            return ReadFoodLog(data);
        }
        return null;
    }

    public List<FoodLog> GetFoodLogs()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        // The newest first.
        cmd.CommandText = SelectFoodLogs + " order by food_log.log_date desc, food_log.id desc";
        var data = GetData(dbConn, cmd);
        var foodLogs = new List<FoodLog>();
        while (data.Read())
        {
            foodLogs.Add(ReadFoodLog(data));
        }
        return foodLogs;
    }

    public bool InsertFoodLog(FoodLog foodLog)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = @"
            insert into food_log (name, quantity, log_date, wasted, category_id)
            values (@name, @quantity, @log_date, @wasted, @category_id)";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, foodLog.Name);
        cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Integer, foodLog.Quantity);
        cmd.Parameters.AddWithValue("@log_date", NpgsqlDbType.Date, foodLog.LogDate);
        cmd.Parameters.AddWithValue("@wasted", NpgsqlDbType.Boolean, foodLog.Wasted);
        // null in C# is sent to the database as DBNull.Value
        cmd.Parameters.AddWithValue("@category_id", NpgsqlDbType.Integer, (object)foodLog.CategoryId ?? DBNull.Value);
        return InsertData(dbConn, cmd);
    }

    public bool DeleteFoodLog(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "delete from food_log where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        return DeleteData(dbConn, cmd);
    }

    // Turns one row of the select into a FoodLog object.
    private static FoodLog ReadFoodLog(NpgsqlDataReader data)
    {
        var foodLog = new FoodLog((int)data["id"])
        {
            Name = (string)data["name"],
            Quantity = (int)data["quantity"],
            LogDate = (DateOnly)data["log_date"], // Npgsql 10 reads a date column as DateOnly
            Wasted = (bool)data["wasted"]
        };
        // An empty (null) column in the database is DBNull.Value in C#.
        if (data["category_id"] != DBNull.Value)
        {
            foodLog.CategoryId = (int)data["category_id"];
            foodLog.CategoryName = (string)data["category_name"];
        }
        return foodLog;
    }
}
