using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

// Like TeacherRepository (Exercise 6.4). The methods are virtual so that Moq can replace them in the tests (Lecture 9).
public class CategoryRepository : BaseRepository
{
    public CategoryRepository(IConfiguration configuration) : base(configuration) { }

    public virtual Category GetCategoryById(int id)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "select * from category where id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
            var data = GetData(dbConn, cmd);
            if (data != null && data.Read())
            {
                return new Category((int)data["id"])
                {
                    Name = data["name"].ToString()
                };
            }
            return null;
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual List<Category> GetCategories()
    {
        NpgsqlConnection dbConn = null;
        var categories = new List<Category>();
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "select * from category order by name";
            var data = GetData(dbConn, cmd);
            if (data != null)
            {
                while (data.Read())
                {
                    categories.Add(new Category((int)data["id"])
                    {
                        Name = data["name"].ToString()
                    });
                }
            }
            return categories;
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual bool InsertCategory(Category c)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "insert into category (name) values (@name)";
            cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, c.Name);
            return InsertData(dbConn, cmd);
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual bool UpdateCategory(Category c)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "update category set name = @name where id = @id";
            cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, c.Name);
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, c.Id);
            return UpdateData(dbConn, cmd);
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual bool DeleteCategory(int id)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "delete from category where id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
            return DeleteData(dbConn, cmd);
        }
        finally
        {
            dbConn?.Close();
        }
    }
}
