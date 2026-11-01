using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class FoodItem
{
    public FoodItem(int id) { Id = id; }
    public int Id { get; set; }

    // Validation on the server (Lecture 7): the API answers 400 Bad Request when a rule is broken.
    [Required]
    public string Name { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public DateOnly PurchaseDate { get; set; }
    public DateOnly? BestBeforeDate { get; set; } // optional (the ? allows null)
    public int? CategoryId { get; set; } // optional
    public int StorageLocationId { get; set; }

    // Only read: the names come from the category and storage_location tables (see FoodItemRepository).
    public string CategoryName { get; set; }
    public string StorageLocationName { get; set; }
}
