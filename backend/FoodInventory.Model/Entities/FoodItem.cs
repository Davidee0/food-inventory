using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

// The same rules and messages as the Angular form (frontend/src/app/rules.ts).
public class FoodItem : IValidatableObject
{
    public FoodItem(int id) { Id = id; }
    public int Id { get; set; }

    [Required(ErrorMessage = "Enter a name."), StringLength(50, ErrorMessage = "Name can be at most 50 characters.")]
    public string Name { get; set; } = "";

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [Required(ErrorMessage = "Enter a purchase date.")]
    public DateOnly? PurchaseDate { get; set; }

    public DateOnly? BestBeforeDate { get; set; }

    public int? CategoryId { get; set; }

    [Required(ErrorMessage = "Choose a storage location.")]
    public int? StorageLocationId { get; set; }

    public string? CategoryName { get; set; } // read from the category table
    public string? StorageLocationName { get; set; } // read from the storage_location table

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (BestBeforeDate < PurchaseDate)
            yield return new ValidationResult("Best before date cannot be before the purchase date.", [nameof(BestBeforeDate)]);
    }
}
