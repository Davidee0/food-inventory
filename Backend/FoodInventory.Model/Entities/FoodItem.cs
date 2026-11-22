using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class FoodItem
{
    public FoodItem(int id) { Id = id; }

    public int Id { get; set; }

    // [ApiController] answers 400 with these messages before the controller method runs.
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, ErrorMessage = "Name can be at most 50 characters")]
    public string Name { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }

    [Required(ErrorMessage = "Purchase date is required")]
    public DateOnly? PurchaseDate { get; set; }

    public DateOnly? BestBeforeDate { get; set; }

    public int? CategoryId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Storage location is required")]
    public int StorageLocationId { get; set; }

    // Read only: joined in by FoodItemRepository, never saved.
    public string CategoryName { get; set; }
    public string StorageLocationName { get; set; }
}
