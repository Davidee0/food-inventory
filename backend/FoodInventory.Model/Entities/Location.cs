namespace FoodInventory.Model.Entities;

public class Location
{
    public Location(int id) { Id = id; }
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
