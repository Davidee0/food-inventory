using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

// Like TeacherRepository (Exercise 6.4). The methods are virtual so that Moq can replace them in the tests (Lecture 9).
public class StorageLocationRepository : BaseRepository
{
    public StorageLocationRepository(IConfiguration configuration) : base(configuration) { }

    public virtual StorageLocation GetStorageLocationById(int id)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "select * from storage_location where id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
            var data = GetData(dbConn, cmd);
            if (data != null && data.Read())
            {
                return new StorageLocation((int)data["id"])
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

    public virtual List<StorageLocation> GetStorageLocations()
    {
        NpgsqlConnection dbConn = null;
        var storageLocations = new List<StorageLocation>();
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "select * from storage_location order by id";
            var data = GetData(dbConn, cmd);
            if (data != null)
            {
                while (data.Read())
                {
                    storageLocations.Add(new StorageLocation((int)data["id"])
                    {
                        Name = data["name"].ToString()
                    });
                }
            }
            return storageLocations;
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual bool InsertStorageLocation(StorageLocation l)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "insert into storage_location (name) values (@name)";
            cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, l.Name);
            return InsertData(dbConn, cmd);
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual bool UpdateStorageLocation(StorageLocation l)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "update storage_location set name = @name where id = @id";
            cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, l.Name);
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, l.Id);
            return UpdateData(dbConn, cmd);
        }
        finally
        {
            dbConn?.Close();
        }
    }

    public virtual bool DeleteStorageLocation(int id)
    {
        NpgsqlConnection dbConn = null;
        try
        {
            dbConn = new NpgsqlConnection(ConnectionString);
            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "delete from storage_location where id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
            return DeleteData(dbConn, cmd);
        }
        finally
        {
            dbConn?.Close();
        }
    }
}
