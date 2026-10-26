using System.Text.RegularExpressions;
using FoodInventory.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Item> Items => Set<Item>();

    // The tables come from database/create_tables.sql, where columns are snake_case: LocationId -> location_id.
    protected override void OnModelCreating(ModelBuilder model)
    {
        foreach (var property in model.Model.GetEntityTypes().SelectMany(t => t.GetProperties()))
            property.SetColumnName(Regex.Replace(property.Name, "(?<=[a-z])([A-Z])", "_$1").ToLowerInvariant());
    }
}
