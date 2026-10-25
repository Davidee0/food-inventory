using System.Text.Json;

namespace FoodInventory.Api.Services;

public static class Json
{
    /// <summary>
    /// Reads the body as a JSON object; null when it is empty, malformed, not an object, or holds text that
    /// can never be stored (invalid UTF-8, a lone surrogate, or a NUL character, which PostgreSQL rejects).
    /// </summary>
    public static async Task<JsonElement?> ReadObject(HttpRequest request)
    {
        try
        {
            using var doc = await JsonDocument.ParseAsync(request.Body);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return null;
            foreach (var property in doc.RootElement.EnumerateObject())
                if (property.Value.ValueKind == JsonValueKind.String && !IsStorable(property.Value)) return null;
            return doc.RootElement.Clone();
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static bool IsStorable(JsonElement text)
    {
        try { return !text.GetString()!.Contains('\0'); }
        catch (InvalidOperationException) { return false; }
    }

    public static bool TryGet(JsonElement obj, string name, out JsonElement value) =>
        obj.TryGetProperty(name, out value) && value.ValueKind != JsonValueKind.Null && value.ValueKind != JsonValueKind.Undefined;

    /// <summary>A JSON number holding a whole value that fits an int (1, 1.0 and 1e0 all count as 1).</summary>
    public static bool TryGetInt(JsonElement el, out int value)
    {
        value = 0;
        if (el.ValueKind != JsonValueKind.Number) return false;
        if (el.TryGetInt32(out value)) return true;
        if (el.TryGetDouble(out var d) && d == Math.Floor(d) && d >= int.MinValue && d <= int.MaxValue)
        {
            value = (int)d;
            return true;
        }
        return false;
    }
}
