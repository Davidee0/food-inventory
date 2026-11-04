namespace FoodInventory.Model.Repositories;

using System.Data;
using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;

// Names are unique ignoring case: name_key is the lower-case copy of the name and is UNIQUE in the table.
// It is made here with ToLowerInvariant(), not with SQL lower(), so Æ, Ø and Å work in any database locale.
public class CategoryRepository(IConfiguration configuration) : BaseRepository(configuration)
{
    private const string Select =
        "SELECT c.id, c.name, (SELECT count(*)::int FROM items i WHERE i.category_id = c.id) AS item_count FROM categories c";

    public List<Category> GetCategories()
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = Select + " ORDER BY c.name_key, c.id";
        using var data = GetData(conn, cmd);
        return ReadCategories(data);
    }

    public Category GetCategoryById(int id)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = Select + " WHERE c.id = @id";
        cmd.Parameters.AddWithValue("@id", id);
        using var data = GetData(conn, cmd);
        return ReadCategories(data).FirstOrDefault();
    }

    // True when another category (not the one with exceptId) already has this name, ignoring case.
    public bool NameExists(string name, int exceptId)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id FROM categories WHERE name_key = @name_key AND id <> @id";
        cmd.Parameters.AddWithValue("@name_key", name.ToLowerInvariant());
        cmd.Parameters.AddWithValue("@id", exceptId);
        using var data = GetData(conn, cmd);
        return data.Read();
    }

    // Returns the new id: RETURNING gives it back like a query.
    public int InsertCategory(string name)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO categories (name, name_key) VALUES (@name, @name_key) RETURNING id";
        cmd.Parameters.AddWithValue("@name", name);
        cmd.Parameters.AddWithValue("@name_key", name.ToLowerInvariant());
        using var data = GetData(conn, cmd);
        data.Read();
        return data.GetInt32("id");
    }

    public bool UpdateCategory(int id, string name)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE categories SET name = @name, name_key = @name_key WHERE id = @id";
        cmd.Parameters.AddWithValue("@name", name);
        cmd.Parameters.AddWithValue("@name_key", name.ToLowerInvariant());
        cmd.Parameters.AddWithValue("@id", id);
        return UpdateData(conn, cmd);
    }

    public bool DeleteCategory(int id)
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM categories WHERE id = @id";
        cmd.Parameters.AddWithValue("@id", id);
        return DeleteData(conn, cmd);
    }

    private static List<Category> ReadCategories(NpgsqlDataReader data)
    {
        var categories = new List<Category>();
        while (data.Read())
            categories.Add(new Category(data.GetInt32("id"))
            {
                Name = data.GetString("name"),
                ItemCount = data.GetInt32("item_count"),
            });
        return categories;
    }
}
