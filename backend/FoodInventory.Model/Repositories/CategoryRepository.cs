using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class CategoryRepository : BaseRepository
{
    public CategoryRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public Category GetCategoryById(int id)
    {
        // "using": the connection is closed again at the end of the method
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from category where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        var data = GetData(dbConn, cmd);
        if (data.Read())
        {
            return new Category((int)data["id"]) { Name = (string)data["name"] };
        }
        return null;
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

    public bool InsertCategory(Category category)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "insert into category (name) values (@name)";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, category.Name);
        return InsertData(dbConn, cmd);
    }

    public bool UpdateCategory(Category category)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "update category set name = @name where id = @id";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, category.Name);
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, category.Id);
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
