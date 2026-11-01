using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class StorageLocation
{
    public StorageLocation(int id) { Id = id; }
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }
}
