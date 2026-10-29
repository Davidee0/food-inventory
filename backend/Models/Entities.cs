using System.ComponentModel.DataAnnotations.Schema;

namespace FoodInventory.Api.Models;

// One class per table in database/create_tables.sql.

[Table("locations")]
public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

[Table("categories")]
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string NameKey { get; set; } = ""; // lower-case copy of Name, UNIQUE in the database
}

[Table("items")]
public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int LocationId { get; set; }
    public Location Location { get; set; } = null!;
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public DateOnly? BestBefore { get; set; }
}
