using System.Globalization;
using System.Text.RegularExpressions;

namespace FoodInventory.Api.Services;

/// <summary>Plain-date helpers. Dates are never timestamps.</summary>
public static partial class DateHelper
{
    [GeneratedRegex(@"^\d{4}-\d{2}-\d{2}$")]
    private static partial Regex Format();

    /// <summary>Today's date on the machine's local clock (not UTC).</summary>
    public static DateOnly Today(DateTime? now = null) => DateOnly.FromDateTime(now ?? DateTime.Now);

    /// <summary>Parses strictly YYYY-MM-DD and rejects impossible dates such as 2026-02-30.</summary>
    public static bool TryParse(string? value, out DateOnly date)
    {
        date = default;
        if (value is null || !Format().IsMatch(value)) return false;
        return DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
    }

    public static bool IsValid(string? value) => TryParse(value, out _);

    public static string AddDays(string value, int days) =>
        DateOnly.ParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture).AddDays(days).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
