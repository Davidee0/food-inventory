namespace FoodInventory.Model.Repositories;

using System.Data;
using FoodInventory.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;

public class LocationRepository(IConfiguration configuration) : BaseRepository(configuration)
{
    public List<Location> GetLocations()
    {
        using var conn = new NpgsqlConnection(ConnectionString);
        var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT id, name FROM locations ORDER BY id";
        using var data = GetData(conn, cmd);
        var locations = new List<Location>();
        while (data.Read())
            locations.Add(new Location(data.GetInt32("id")) { Name = data.GetString("name") });
        return locations;
    }
}
