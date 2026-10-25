using System.Globalization;

namespace FoodInventory.Api.Services;

public static class Ids
{
    /// <summary>Digits only: "+1", " 1", "1.0" and "abc" are not ids (they give 404).</summary>
    public static bool TryParse(string? value, out int id)
    {
        id = 0;
        if (string.IsNullOrEmpty(value) || !value.All(char.IsAsciiDigit)) return false;
        return int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out id);
    }
}
