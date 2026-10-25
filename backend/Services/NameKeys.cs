namespace FoodInventory.Api.Services;

/// <summary>
/// Case-insensitive key for names (handles Æ Ø Å). Computed in the app, so it does not depend on the
/// database locale. Used for the UNIQUE categories.name_key and for sorting.
/// </summary>
public static class NameKeys
{
    public static string Of(string name) => name.ToLowerInvariant();
}
