using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace FoodInventory.Model.Repositories;

public class StorageLocationRepository : BaseRepository
{
    public StorageLocationRepository(IConfiguration configuration) : base(configuration) { }

    public List<StorageLocation> GetStorageLocations()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from storage_location order by id";
        var data = GetData(dbConn, cmd);
        var locations = new List<StorageLocation>();
        while (data.Read())
        {
            locations.Add(new StorageLocation((int)data["id"]) { Name = (string)data["name"] });
        }
        return locations;
    }
}
