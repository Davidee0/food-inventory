namespace FoodInventory.Model.Entities;

// A row of the locations table: Fridge, Freezer or Pantry.
public class Location
{
    public Location(int id) { Id = id; }
    public int Id { get; set; }
    public string Name { get; set; }
}
