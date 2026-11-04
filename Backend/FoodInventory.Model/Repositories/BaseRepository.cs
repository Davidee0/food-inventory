namespace FoodInventory.Model.Repositories;

using Npgsql;
using Microsoft.Extensions.Configuration;

// From the course (lecture 4): every repository reads and writes the database through these methods.
public class BaseRepository
{
    protected string ConnectionString { get; }

    public BaseRepository(IConfiguration configuration)
    {
        ConnectionString = configuration.GetConnectionString("AppProgDb");
    }

    protected NpgsqlDataReader GetData(NpgsqlConnection conn, NpgsqlCommand cmd)
    {
        conn.Open();
        return cmd.ExecuteReader();
    }

    protected bool InsertData(NpgsqlConnection conn, NpgsqlCommand cmd)
    {
        conn.Open();
        cmd.ExecuteNonQuery();
        return true;
    }

    protected bool UpdateData(NpgsqlConnection conn, NpgsqlCommand cmd)
    {
        conn.Open();
        cmd.ExecuteNonQuery();
        return true;
    }

    protected bool DeleteData(NpgsqlConnection conn, NpgsqlCommand cmd)
    {
        conn.Open();
        cmd.ExecuteNonQuery();
        return true;
    }
}
