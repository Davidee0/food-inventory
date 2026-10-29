using System.ComponentModel.DataAnnotations;

namespace FoodInventory.Model.Entities;

public class Category
{
    public Category(int id) { Id = id; }
    public int Id { get; set; }
    [Required] // also refuses "" and spaces
    public string Name { get; set; } = "";
}
