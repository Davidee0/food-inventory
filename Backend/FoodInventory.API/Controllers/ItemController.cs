using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

// Ids are numbers: {id:int} sends /api/Item/abc to a plain 404.
[Route("api/[controller]")]
[ApiController]
public class ItemController(ItemRepository items, LocationRepository locations, CategoryRepository categories) : ControllerBase
{
    // Soonest best before date first, items without a date last, ties by name ignoring case.
    [HttpGet]
    public ActionResult<IEnumerable<Item>> GetItems() => Ok(items.GetItems());

    [HttpGet("{id:int}")]
    public ActionResult<Item> GetItem(int id) => items.GetItemById(id) is { } item ? Ok(item) : ItemNotFound();

    // 201 Created, with a Location header that points to the new item.
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public ActionResult<Item> Post(ItemRequest request)
    {
        var errors = Check(request);
        if (errors.Count > 0) return BadRequest(new { errors });
        var id = items.InsertItem(ToItem(request, 0));
        return CreatedAtAction(nameof(GetItem), new { id }, items.GetItemById(id));
    }

    // PUT replaces the whole item: send every field.
    [HttpPut("{id:int}")]
    public ActionResult<Item> Put(int id, ItemRequest request)
    {
        if (items.GetItemById(id) is null) return ItemNotFound();
        var errors = Check(request);
        if (errors.Count > 0) return BadRequest(new { errors });
        items.UpdateItem(ToItem(request, id));
        return Ok(items.GetItemById(id));
    }

    [HttpDelete("{id:int}")]
    public ActionResult Delete(int id)
    {
        if (items.GetItemById(id) is null) return ItemNotFound();
        items.DeleteItem(id);
        return NoContent();
    }

    private NotFoundObjectResult ItemNotFound() => NotFound(new { message = "Item not found." });

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
