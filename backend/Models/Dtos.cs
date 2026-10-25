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

/// <summary>Documentation-only shape of the item request body (controllers read the raw JSON so wrong types give 400).</summary>
public record ItemRequest(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("location_id")] int LocationId,
    [property: JsonPropertyName("category_id")] int? CategoryId,
    [property: JsonPropertyName("purchase_date")] DateOnly PurchaseDate,
    [property: JsonPropertyName("best_before")] DateOnly? BestBefore);

/// <summary>Documentation-only shape of the category request body.</summary>
public record CategoryRequest([property: JsonPropertyName("name")] string Name);
