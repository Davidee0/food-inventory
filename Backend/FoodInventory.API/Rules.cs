using System.Globalization;

namespace FoodInventory.API;

// What the API receives. Every field may be missing, so a missing field gets its own message.
public record ItemRequest(string Name, int? LocationId, int? CategoryId, string PurchaseDate, string BestBefore);

public record CategoryRequest(string Name);

// The validation rules and messages. The Angular form uses the same ones (Frontend/FoodInventory.NG/src/app/rules.ts).
public static class Rules
{
    public const string Location = "Choose a storage location.";
    public const string Category = "Choose a category from the list.";

    // One message per field; empty when the item is valid. Whether the ids exist is checked by the controller.
    public static Dictionary<string, string> Item(ItemRequest r)
    {
        var errors = new Dictionary<string, string>();
        if (Name(r.Name, 50) is { } name) errors["name"] = name;
        if (r.LocationId is null) errors["locationId"] = Location;

        var purchase = Date(r.PurchaseDate);
        if (string.IsNullOrWhiteSpace(r.PurchaseDate)) errors["purchaseDate"] = "Enter a purchase date.";
        else if (purchase is null) errors["purchaseDate"] = "Enter a valid date.";

        if (!string.IsNullOrWhiteSpace(r.BestBefore))
        {
            var bestBefore = Date(r.BestBefore);
            if (bestBefore is null) errors["bestBefore"] = "Enter a valid date.";
            else if (bestBefore < purchase) errors["bestBefore"] = "Best before date cannot be before the purchase date.";
        }
        return errors;
    }

    // The message for a missing or too long name, or null when it is fine. Text is trimmed first.
    public static string Name(string name, int max) =>
        string.IsNullOrWhiteSpace(name) || name.Contains('\0') ? "Enter a name." // PostgreSQL cannot store \0
        : name.Trim().Length > max ? $"Name can be at most {max} characters."
        : null;

    // A real calendar date written as YYYY-MM-DD (2026-02-30 is not), or null.
    public static DateOnly? Date(string text) =>
        DateOnly.TryParseExact(text?.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date) ? date : null;
}
