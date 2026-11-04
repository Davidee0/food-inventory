namespace FoodInventory.Model.Entities;

// A row of the items table, with the names of its location and category.
public class Item
{
    public Item(int id) { Id = id; }
    public int Id { get; set; }
    public string Name { get; set; }
    public int LocationId { get; set; }
    public int? CategoryId { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public DateOnly? BestBefore { get; set; }
    public string LocationName { get; set; }
    public string CategoryName { get; set; } // null when the item has no category
}
