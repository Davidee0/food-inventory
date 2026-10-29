using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class CategoryRepository : BaseRepository
{
    public CategoryRepository(IConfiguration configuration) : base(configuration) { }

    public Category? GetCategoryById(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from category where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        var data = GetData(dbConn, cmd);
        return data.Read() ? new Category((int)data["id"]) { Name = (string)data["name"] } : null;
    }

    public List<Category> GetCategories()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from category order by name";
        var data = GetData(dbConn, cmd);
        var categories = new List<Category>();
        while (data.Read())
        {
            categories.Add(new Category((int)data["id"]) { Name = (string)data["name"] });
        }
        return categories;
    }

    public bool InsertCategory(Category c)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "insert into category (name) values (@name)";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, c.Name);
        return InsertData(dbConn, cmd);
    }

    public bool UpdateCategory(Category c)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "update category set name = @name where id = @id";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, c.Name);
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, c.Id);
        return UpdateData(dbConn, cmd);
    }

    public bool DeleteCategory(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "delete from category where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        return DeleteData(dbConn, cmd);
    }
}
