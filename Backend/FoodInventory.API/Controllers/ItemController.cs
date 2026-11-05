using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ItemController(ItemRepository items, LocationRepository locations, CategoryRepository categories) : ControllerBase
{
    // Soonest best before date first, items without a date last, ties by name ignoring case.
    [HttpGet]
    public ActionResult<IEnumerable<Item>> GetItems() => Ok(items.GetItems());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Item> GetItem(string id) => Find(id) is { } item ? Ok(item) : ItemNotFound();

    // 201 Created, with a Location header that points to the new item.
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<Item> Post(ItemRequest request)
    {
        var errors = Check(request);
        if (errors.Count > 0) return BadRequest(new { errors });
        var id = items.InsertItem(ToItem(request, 0));
        return CreatedAtAction(nameof(GetItem), new { id }, items.GetItemById(id));
    }

    // PUT replaces the whole item: send every field.
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Item> Put(string id, ItemRequest request)
    {
        if (Find(id) is not { } item) return ItemNotFound();
        var errors = Check(request);
        if (errors.Count > 0) return BadRequest(new { errors });
        items.UpdateItem(ToItem(request, item.Id));
        return Ok(items.GetItemById(item.Id));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult Delete(string id)
    {
        if (Find(id) is not { } item) return ItemNotFound();
        items.DeleteItem(item.Id);
        return NoContent();
    }

    private NotFoundObjectResult ItemNotFound() => NotFound(new { message = "Item not found." });

    // A non-numeric id ("abc") is simply not found.
    private Item Find(string id) => int.TryParse(id, out var n) ? items.GetItemById(n) : null;

    // The item rules, then what only the database knows: the chosen location and category exist.
    private Dictionary<string, string> Check(ItemRequest r)
    {
        var errors = Rules.Item(r);
        if (!errors.ContainsKey("locationId") && !locations.GetLocations().Any(l => l.Id == r.LocationId))
            errors["locationId"] = Rules.Location;
        if (r.CategoryId is { } categoryId && categories.GetCategoryById(categoryId) is null)
            errors["categoryId"] = Rules.Category;
        return errors;
    }

    private static Item ToItem(ItemRequest r, int id) => new(id)
    {
        Name = r.Name.Trim(),
        LocationId = r.LocationId.Value,
        CategoryId = r.CategoryId,
        PurchaseDate = Rules.Date(r.PurchaseDate).Value,
        BestBefore = Rules.Date(r.BestBefore),
    };
}
