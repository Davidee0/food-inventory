using System.Text.Json;
using FoodInventory.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Services;

public record ItemInput(string Name, int LocationId, int? CategoryId, DateOnly PurchaseDate, DateOnly? BestBefore);

public static class Validation
{
    public const int ItemNameMax = 50;
    public const int CategoryNameMax = 30;

    /// <summary>Returns the trimmed name, or sets an error. Non-string values count as missing.</summary>
    public static string? Name(JsonElement body, int max, Dictionary<string, string> errors)
    {
        var name = Json.TryGet(body, "name", out var el) && el.ValueKind == JsonValueKind.String
            ? el.GetString()!.Trim()
            : "";
        if (name.Length == 0) { errors["name"] = "Enter a name."; return null; }
        if (name.Length > max) { errors["name"] = $"Name can be at most {max} characters."; return null; }
        return name;
    }

    public static async Task<ItemInput?> Item(JsonElement body, AppDbContext db, Dictionary<string, string> errors)
    {
        var name = Name(body, ItemNameMax, errors);

        var locationId = 0;
        if (!(Json.TryGet(body, "location_id", out var loc) && Json.TryGetInt(loc, out locationId)
              && await db.Locations.AnyAsync(l => l.Id == locationId)))
            errors["location_id"] = "Choose a storage location.";

        DateOnly purchase = default;
        var purchaseOk = false;
        if (!Json.TryGet(body, "purchase_date", out var pd) || (pd.ValueKind == JsonValueKind.String && pd.GetString()!.Trim().Length == 0))
            errors["purchase_date"] = "Enter a purchase date.";
        else if (pd.ValueKind == JsonValueKind.String && DateHelper.TryParse(pd.GetString()!.Trim(), out purchase)) purchaseOk = true;
        else errors["purchase_date"] = "Enter a valid date.";

        DateOnly? best = null;
        if (Json.TryGet(body, "best_before", out var bb) && !(bb.ValueKind == JsonValueKind.String && bb.GetString()!.Trim().Length == 0))
        {
            if (bb.ValueKind == JsonValueKind.String && DateHelper.TryParse(bb.GetString()!.Trim(), out var b))
            {
                if (purchaseOk && b < purchase) errors["best_before"] = "Best before date cannot be before the purchase date.";
                else best = b;
            }
            else errors["best_before"] = "Enter a valid date.";
        }

        int? categoryId = null;
        if (Json.TryGet(body, "category_id", out var cat))
        {
            if (Json.TryGetInt(cat, out var cid) && await db.Categories.AnyAsync(c => c.Id == cid))
                categoryId = cid;
            else errors["category_id"] = "Choose a category from the list.";
        }

        return errors.Count > 0 ? null : new ItemInput(name!, locationId, categoryId, purchase, best);
    }
}
