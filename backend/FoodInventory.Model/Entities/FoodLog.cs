using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

// One row of the history (US14): food that was eaten, or thrown away (wasted).
public class FoodLog
{
    public FoodLog(int id) { Id = id; }
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public DateOnly LogDate { get; set; }
    public bool Wasted { get; set; } // true: thrown away, false: eaten
    public int? CategoryId { get; set; } // optional

    // Only read: the name comes from the category table (see FoodLogRepository).
    public string CategoryName { get; set; }
}
