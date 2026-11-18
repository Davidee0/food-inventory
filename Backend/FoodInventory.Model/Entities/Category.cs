using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class Category
{
    public Category(int id) { Id = id; }

    public int Id { get; set; }

    // Lecture 7: server-side validation. A missing or too long name gets 400 with this message.
    [Required(ErrorMessage = "Name is required")]
    [StringLength(30, ErrorMessage = "Name can be at most 30 characters")]
    public string Name { get; set; }
}
