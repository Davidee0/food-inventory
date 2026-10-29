using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace FoodInventory.Model.Repositories;

public class LocationRepository : BaseRepository
{
    public LocationRepository(IConfiguration configuration) : base(configuration) { }

    public List<Location> GetLocations()
    {
        using var dbConn = new NpgsqlConnection(ConnectionString);
        var cmd = dbConn.CreateCommand();
        cmd.CommandText = "select * from location order by id";
        var data = GetData(dbConn, cmd);
        var locations = new List<Location>();
        while (data.Read())
        {
            locations.Add(new Location((int)data["id"]) { Name = (string)data["name"] });
        }
        return locations;
    }
}
