namespace FoodInventory.Model.Entities;

// A row of the categories table, with the number of items that use it.
public class Category
{
    public Category(int id) { Id = id; }
    public int Id { get; set; }
    public string Name { get; set; }
    public int ItemCount { get; set; }
}
