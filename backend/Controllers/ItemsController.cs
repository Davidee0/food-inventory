using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using FoodInventory.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

[ApiController]
[Route("items")]
public class ItemsController(AppDbContext db) : ControllerBase
{
    private static readonly MessageDto NotFoundBody = new("Item not found.");
    private static readonly MessageDto BadJsonBody = new("The request body is not valid JSON.");

    private static IQueryable<ItemDto> ToDtos(IQueryable<Item> items) => items.Select(i => new ItemDto(
        i.Id, i.Name, i.PurchaseDate, i.BestBefore, i.LocationId, i.Location.Name, i.CategoryId,
        i.Category == null ? null : i.Category.Name));

    private Task<ItemDto?> Find(int id) => ToDtos(db.Items.AsNoTracking().Where(i => i.Id == id)).FirstOrDefaultAsync();

    [HttpGet]
    public async Task<List<ItemDto>> List() =>
        await ToDtos(db.Items.AsNoTracking()
            .OrderBy(i => i.BestBefore == null)
            .ThenBy(i => i.BestBefore)
            .ThenBy(i => i.Name.ToLower())
            .ThenBy(i => i.Id)).ToListAsync();

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        if (!int.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var item = await Find(n);
        return item is null ? NotFound(NotFoundBody) : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create()
    {
        var body = await Json.ReadObject(Request);
        if (body is null) return BadRequest(BadJsonBody);
        var errors = new Dictionary<string, string>();
        var input = await Validation.Item(body.Value, db, errors);
        if (input is null) return BadRequest(new ErrorsDto(errors));

        var item = new Item
        {
            Name = input.Name, LocationId = input.LocationId, CategoryId = input.CategoryId,
            PurchaseDate = input.PurchaseDate, BestBefore = input.BestBefore,
        };
        db.Items.Add(item);
        await db.SaveChangesAsync();
        return Created($"/items/{item.Id}", await Find(item.Id));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Replace(string id)
    {
        if (!int.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var item = await db.Items.FirstOrDefaultAsync(i => i.Id == n);
        if (item is null) return NotFound(NotFoundBody);

        var body = await Json.ReadObject(Request);
        if (body is null) return BadRequest(BadJsonBody);
        var errors = new Dictionary<string, string>();
        var input = await Validation.Item(body.Value, db, errors);
        if (input is null) return BadRequest(new ErrorsDto(errors));

        item.Name = input.Name;
        item.LocationId = input.LocationId;
        item.CategoryId = input.CategoryId;
        item.PurchaseDate = input.PurchaseDate;
        item.BestBefore = input.BestBefore;
        await db.SaveChangesAsync();
        return Ok(await Find(n));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!int.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var item = await db.Items.FirstOrDefaultAsync(i => i.Id == n);
        if (item is null) return NotFound(NotFoundBody);
        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
