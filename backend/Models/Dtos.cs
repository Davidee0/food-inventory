using System.Text.Json.Serialization;

namespace FoodInventory.Api.Models;

public record LocationDto(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name);

public record ItemDto(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("purchase_date")] DateOnly PurchaseDate,
    [property: JsonPropertyName("best_before")] DateOnly? BestBefore,
    [property: JsonPropertyName("location_id")] int LocationId,
    [property: JsonPropertyName("location_name")] string LocationName,
    [property: JsonPropertyName("category_id")] int? CategoryId,
    [property: JsonPropertyName("category_name")] string? CategoryName);

public record CategoryDto(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("item_count")] int ItemCount);

public record CategoryRefDto(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("name")] string Name);

public record MessageDto([property: JsonPropertyName("message")] string Message);

public record ErrorsDto([property: JsonPropertyName("errors")] Dictionary<string, string> Errors);

public record InUseDto(
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("itemCount")] int ItemCount);
