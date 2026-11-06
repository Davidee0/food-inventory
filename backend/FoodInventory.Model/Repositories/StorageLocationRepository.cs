using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace FoodInventory.Model.Repositories;

public class StorageLocationRepository : BaseRepository
{
    public StorageLocationRepository(IConfiguration configuration) : base(configuration)
    {
    }

    public StorageLocation GetStorageLocationById(int id)
    {
        // "using": the connection is closed again at the end of the method
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from storage_location where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        var data = GetData(dbConn, cmd);
        if (data.Read())
        {
            return new StorageLocation((int)data["id"]) { Name = (string)data["name"] };
        }
        return null;
    }

    public List<StorageLocation> GetStorageLocations()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from storage_location order by name";
        var data = GetData(dbConn, cmd);
        var storageLocations = new List<StorageLocation>();
        while (data.Read())
        {
            storageLocations.Add(new StorageLocation((int)data["id"]) { Name = (string)data["name"] });
        }
        return storageLocations;
    }

    public bool InsertStorageLocation(StorageLocation storageLocation)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "insert into storage_location (name) values (@name)";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, storageLocation.Name);
        return InsertData(dbConn, cmd);
    }

    public bool UpdateStorageLocation(StorageLocation storageLocation)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "update storage_location set name = @name where id = @id";
        cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Varchar, storageLocation.Name);
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, storageLocation.Id);
        return UpdateData(dbConn, cmd);
    }

    public bool DeleteStorageLocation(int id)
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "delete from storage_location where id = @id";
        cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
        return DeleteData(dbConn, cmd);
    }
}
