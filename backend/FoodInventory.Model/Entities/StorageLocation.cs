namespace FoodInventory.Model.Entities;

public class StorageLocation
{
    public StorageLocation(int id) { Id = id; }
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
