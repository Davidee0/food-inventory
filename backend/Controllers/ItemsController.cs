using System.Linq.Expressions;
using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

[ApiController]
[Route("items")]
public class ItemsController(AppDbContext db) : ControllerBase
{
    private static readonly Expression<Func<Item, ItemDto>> ToDto = i => new ItemDto(i.Id, i.Name, i.PurchaseDate, i.BestBefore,
        i.LocationId, i.Location.Name, i.CategoryId, i.Category == null ? null : i.Category.Name);

    private NotFoundObjectResult NotFoundMessage() => NotFound(new { message = "Item not found." });

    // Soonest best before date first, items without a date last, ties by name ignoring case.
    [HttpGet]
    public Task<List<ItemDto>> List() => db.Items
        .OrderBy(i => i.BestBefore == null).ThenBy(i => i.BestBefore).ThenBy(i => i.Name.ToLower()).ThenBy(i => i.Id)
        .Select(ToDto).ToListAsync();

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id) =>
        int.TryParse(id, out var n) && await Dto(n) is { } item ? Ok(item) : NotFoundMessage();

    [HttpPost]
    public async Task<IActionResult> Create(ItemRequest request)
    {
        var errors = await Check(request);
        if (errors.Count > 0) return BadRequest(new { errors });
        var item = new Item();
        Copy(request, item);
        db.Items.Add(item);
        await db.SaveChangesAsync();
        return Created($"/items/{item.Id}", await Dto(item.Id));
    }

    // PUT replaces the whole item: send every field.
    [HttpPut("{id}")]
    public async Task<IActionResult> Replace(string id, ItemRequest request)
    {
        if (await Find(id) is not { } item) return NotFoundMessage();
        var errors = await Check(request);
        if (errors.Count > 0) return BadRequest(new { errors });
        Copy(request, item);
        await db.SaveChangesAsync();
        return Ok(await Dto(item.Id));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (await Find(id) is not { } item) return NotFoundMessage();
        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // A non-numeric id ("abc") is simply not found.
    private async Task<Item?> Find(string id) => int.TryParse(id, out var n) ? await db.Items.FindAsync(n) : null;

    private Task<ItemDto?> Dto(int id) => db.Items.Where(i => i.Id == id).Select(ToDto).FirstOrDefaultAsync();

    // The item rules, then what only the database knows: the chosen location and category exist.
    private async Task<Dictionary<string, string>> Check(ItemRequest r)
    {
        var errors = Rules.Item(r);
        if (!errors.ContainsKey("location_id") && !await db.Locations.AnyAsync(l => l.Id == r.LocationId))
            errors["location_id"] = Rules.Location;
        if (r.CategoryId is not null && !await db.Categories.AnyAsync(c => c.Id == r.CategoryId))
            errors["category_id"] = Rules.Category;
        return errors;
    }

    private static void Copy(ItemRequest r, Item item)
    {
        item.Name = r.Name!.Trim();
        item.LocationId = r.LocationId!.Value;
        item.CategoryId = r.CategoryId;
        item.PurchaseDate = Rules.Date(r.PurchaseDate)!.Value;
        item.BestBefore = Rules.Date(r.BestBefore);
    }
}
