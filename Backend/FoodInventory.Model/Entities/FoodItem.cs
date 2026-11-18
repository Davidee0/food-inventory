using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class FoodItem
{
    public FoodItem(int id) { Id = id; }

    public int Id { get; set; }

    // Lecture 7: server-side validation. [ApiController] answers 400 with these messages before the controller method runs.
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, ErrorMessage = "Name can be at most 50 characters")]
    public string Name { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }

    [Required(ErrorMessage = "Purchase date is required")]
    public DateOnly? PurchaseDate { get; set; }

    public DateOnly? BestBeforeDate { get; set; } // optional

    public int? CategoryId { get; set; } // optional

    [Range(1, int.MaxValue, ErrorMessage = "Storage location is required")]
    public int StorageLocationId { get; set; }

    // Read only: the names that belong to the two ids, joined in by FoodItemRepository.
    public string CategoryName { get; set; }
    public string StorageLocationName { get; set; }
}
