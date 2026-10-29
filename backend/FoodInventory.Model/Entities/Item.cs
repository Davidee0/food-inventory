using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class Item
{
    public Item(int id) { Id = id; }
    public int Id { get; set; }
    [Required] // also refuses "" and spaces
    public string Name { get; set; } = "";
    public int LocationId { get; set; }
    public int? CategoryId { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public DateOnly? BestBefore { get; set; }
    public string? LocationName { get; set; } // read from the location table
    public string? CategoryName { get; set; } // read from the category table
}
