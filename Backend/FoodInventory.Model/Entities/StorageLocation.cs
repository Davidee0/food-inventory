using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class StorageLocation
{
    public StorageLocation(int id) { Id = id; }

    public int Id { get; set; }

    [Required(ErrorMessage = "Name is required")]
    [StringLength(30, ErrorMessage = "Name can be at most 30 characters")]
    public string Name { get; set; }
}
