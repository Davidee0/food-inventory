using System.Text.Json;

namespace FoodInventory.Api.Services;

public static class Json
{
    /// <summary>Reads the body as a JSON object; null when it is empty, malformed or not an object.</summary>
    public static async Task<JsonElement?> ReadObject(HttpRequest request)
    {
        try
        {
            using var doc = await JsonDocument.ParseAsync(request.Body);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return null;
            return doc.RootElement.Clone();
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public static bool TryGet(JsonElement obj, string name, out JsonElement value) =>
        obj.TryGetProperty(name, out value) && value.ValueKind != JsonValueKind.Null && value.ValueKind != JsonValueKind.Undefined;
}
