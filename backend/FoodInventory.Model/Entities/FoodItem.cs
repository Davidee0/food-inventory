namespace FoodInventory.Model.Entities;

public class FoodItem
{
    public FoodItem(int id) { Id = id; }
    public int Id { get; set; }
    public string Name { get; set; }
    public int Quantity { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public DateOnly? BestBeforeDate { get; set; }
    public int? CategoryId { get; set; }
    public int StorageLocationId { get; set; }
    public string CategoryName { get; set; } // read from the category table
    public string StorageLocationName { get; set; } // read from the storage_location table
}
