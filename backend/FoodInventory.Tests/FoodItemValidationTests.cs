using System.ComponentModel.DataAnnotations;
using FoodInventory.Model.Entities;

namespace FoodInventory.Tests;

// The API's rules for a food item (lecture 9: never trust user input). The messages are the same as the
// Angular form's (frontend/src/app/rules.ts), so these tests and rules.spec.ts check the same rules.
public class FoodItemValidationTests
{
    private static FoodItem Valid() => new(0)
    {
        Name = "Milk",
        Quantity = 1,
        PurchaseDate = new DateOnly(2026, 5, 1),
        StorageLocationId = 1,
    };

    // The same check ASP.NET runs on a request body before the controller sees it ([ApiController]).
    private static List<string?> Messages(FoodItem item)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(item, new ValidationContext(item), results, validateAllProperties: true);
        return results.Select(r => r.ErrorMessage).ToList();
    }

    [Fact]
    public void ValidItem_HasNoMessages()
    {
        Assert.Empty(Messages(Valid()));
    }

    [Fact]
    public void EmptyItem_GivesAMessageForEachRequiredField()
    {
        var item = new FoodItem(0) { Name = "", Quantity = 0, PurchaseDate = null, StorageLocationId = null };

        var messages = Messages(item);

        Assert.Contains("Enter a name.", messages);
        Assert.Contains("Quantity must be at least 1.", messages);
        Assert.Contains("Enter a purchase date.", messages);
        Assert.Contains("Choose a storage location.", messages);
    }

    [Fact]
    public void LongName_IsRefused()
    {
        var item = Valid();
        item.Name = new string('x', 51);

        Assert.Equal(new List<string?> { "Name can be at most 50 characters." }, Messages(item));
    }

    [Theory]
    [InlineData(2026, 4, 30, false)] // a day before the purchase date
    [InlineData(2026, 5, 1, true)] // the purchase date itself
    public void BestBeforeDate_CannotBeBeforePurchaseDate(int y, int m, int d, bool ok)
    {
        var item = Valid();
        item.BestBeforeDate = new DateOnly(y, m, d);

        var messages = Messages(item);

        if (ok) Assert.Empty(messages);
        else Assert.Equal(new List<string?> { "Best before date cannot be before the purchase date." }, messages);
    }
}
