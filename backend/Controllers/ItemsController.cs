using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using FoodInventory.Api.Services;
using FoodInventory.Api.Swagger;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

[ApiController]
[Route("items")]
public class ItemsController(AppDbContext db) : ControllerBase
{
    private const string ItemExample =
        """{"name":"Milk","location_id":1,"category_id":1,"purchase_date":"2026-01-15","best_before":"2026-01-22"}""";

    private static readonly MessageDto NotFoundBody = new("Item not found.");
    private static readonly MessageDto BadJsonBody = new("The request body is not valid JSON.");

    private static IQueryable<ItemDto> ToDtos(IQueryable<Item> items) => items.Select(i => new ItemDto(
        i.Id, i.Name, i.PurchaseDate, i.BestBefore, i.LocationId, i.Location.Name, i.CategoryId,
        i.Category == null ? null : i.Category.Name));

    private Task<ItemDto?> Find(int id) => ToDtos(db.Items.AsNoTracking().Where(i => i.Id == id)).FirstOrDefaultAsync();

    [HttpGet]
    [ProducesResponseType(typeof(List<ItemDto>), StatusCodes.Status200OK)]
    public async Task<List<ItemDto>> List()
    {
        // Sorted here, not in SQL, so the order does not depend on the database collation.
        var items = await ToDtos(db.Items.AsNoTracking()).ToListAsync();
        return items
            .OrderBy(i => i.BestBefore is null)
            .ThenBy(i => i.BestBefore)
            .ThenBy(i => NameKeys.Of(i.Name), StringComparer.Ordinal)
            .ThenBy(i => i.Id)
            .ToList();
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(MessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(string id)
    {
        if (!Ids.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var item = await Find(n);
        return item is null ? NotFound(NotFoundBody) : Ok(item);
    }

    [HttpPost]
    [JsonBody(typeof(ItemRequest), ItemExample)]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorsDto), StatusCodes.Status400BadRequest)]
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
    [JsonBody(typeof(ItemRequest), ItemExample)]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorsDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(MessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Replace(string id)
    {
        if (!Ids.TryParse(id, out var n)) return NotFound(NotFoundBody);
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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(MessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        if (!Ids.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var item = await db.Items.FirstOrDefaultAsync(i => i.Id == n);
        if (item is null) return NotFound(NotFoundBody);
        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
