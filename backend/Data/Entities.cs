namespace FoodInventory.Api.Data;

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string NameKey { get; set; } = "";
}

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
