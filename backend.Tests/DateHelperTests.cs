using FoodInventory.Api.Services;

namespace FoodInventory.Api.Tests;

public class DateHelperTests
{
    [Fact]
    public void Today_uses_the_local_calendar_date()
    {
        var late = new DateTime(2026, 3, 31, 23, 30, 0, DateTimeKind.Local);
        Assert.Equal(new DateOnly(2026, 3, 31), DateHelper.Today(late));
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), DateHelper.Today());
    }

    [Theory]
    [InlineData("2026-02-28", true)]
    [InlineData("2028-02-29", true)]
    [InlineData("2026-02-29", false)]
    [InlineData("2026-02-30", false)]
    [InlineData("2026-13-01", false)]
    [InlineData("2026-2-3", false)]
    [InlineData("03/02/2026", false)]
    [InlineData("2026-02-03T10:00:00Z", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsValid_checks_real_calendar_dates_in_YYYY_MM_DD(string? value, bool expected) =>
        Assert.Equal(expected, DateHelper.IsValid(value));

    [Theory]
    [InlineData("2026-01-30", 3, "2026-02-02")]
    [InlineData("2026-12-30", 3, "2027-01-02")]
    [InlineData("2026-03-01", -1, "2026-02-28")]
    [InlineData("2028-02-28", 1, "2028-02-29")]
    public void AddDays_crosses_month_and_year_ends(string start, int days, string expected) =>
        Assert.Equal(expected, DateHelper.AddDays(start, days));
}
