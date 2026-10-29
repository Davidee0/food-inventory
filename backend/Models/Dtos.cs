using System.Text.Json.Serialization;

namespace FoodInventory.Api.Models;

// What the API receives and returns. Property names become snake_case JSON (see Program.cs).
// Request fields are nullable so a missing field reaches the validation rules instead of failing.

public record ItemRequest(string? Name, int? LocationId, int? CategoryId, string? PurchaseDate, string? BestBefore);

public record CategoryRequest(string? Name);

public record LocationRequest(string? Name);

public record ItemDto(int Id, string Name, DateOnly PurchaseDate, DateOnly? BestBefore,
    int LocationId, string LocationName, int? CategoryId, string? CategoryName);

public record CategoryDto(int Id, string Name, int ItemCount);

public record LocationDto(int Id, string Name, int ItemCount);

public record InUseDto(string Message, [property: JsonPropertyName("itemCount")] int ItemCount);
