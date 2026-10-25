using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using FoodInventory.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FoodInventory.Api.Controllers;

[ApiController]
[Route("categories")]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    private static readonly MessageDto NotFoundBody = new("Category not found.");
    private static readonly MessageDto BadJsonBody = new("The request body is not valid JSON.");

    // Case-insensitive key (handles Æ Ø Å); computed in the app so it does not depend on DB locale.
    private static string Key(string name) => name.ToLowerInvariant();

    private ConflictObjectResult Duplicate(string name) => Conflict(new MessageDto($"{name} already exists."));

    private static bool IsViolation(DbUpdateException e, string sqlState) =>
        e.InnerException is PostgresException pg && pg.SqlState == sqlState;

    [HttpGet]
    public async Task<List<CategoryDto>> List()
    {
        var list = await db.Categories.AsNoTracking()
            .Select(c => new CategoryDto(c.Id, c.Name, db.Items.Count(i => i.CategoryId == c.Id)))
            .ToListAsync();
        return list.OrderBy(c => c.Name, StringComparer.OrdinalIgnoreCase).ThenBy(c => c.Id).ToList();
    }

    [HttpPost]
    public async Task<IActionResult> Create()
    {
        var body = await Json.ReadObject(Request);
        if (body is null) return BadRequest(BadJsonBody);
        var errors = new Dictionary<string, string>();
        var name = Validation.Name(body.Value, Validation.CategoryNameMax, errors);
        if (name is null) return BadRequest(new ErrorsDto(errors));

        var key = Key(name);
        if (await db.Categories.AnyAsync(c => c.NameKey == key)) return Duplicate(name);
        var category = new Category { Name = name, NameKey = key };
        db.Categories.Add(category);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException e) when (IsViolation(e, PostgresErrorCodes.UniqueViolation)) { return Duplicate(name); }
        return Created($"/categories/{category.Id}", new CategoryDto(category.Id, category.Name, 0));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Rename(string id)
    {
        if (!int.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == n);
        if (category is null) return NotFound(NotFoundBody);

        var body = await Json.ReadObject(Request);
        if (body is null) return BadRequest(BadJsonBody);
        var errors = new Dictionary<string, string>();
        var name = Validation.Name(body.Value, Validation.CategoryNameMax, errors);
        if (name is null) return BadRequest(new ErrorsDto(errors));

        var key = Key(name);
        if (await db.Categories.AnyAsync(c => c.NameKey == key && c.Id != n)) return Duplicate(name);
        category.Name = name;
        category.NameKey = key;
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException e) when (IsViolation(e, PostgresErrorCodes.UniqueViolation)) { return Duplicate(name); }
        return Ok(new CategoryRefDto(category.Id, category.Name));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!int.TryParse(id, out var n)) return NotFound(NotFoundBody);
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == n);
        if (category is null) return NotFound(NotFoundBody);

        var count = await db.Items.CountAsync(i => i.CategoryId == n);
        if (count > 0) return InUse(category.Name, count);
        db.Categories.Remove(category);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException e) when (IsViolation(e, PostgresErrorCodes.ForeignKeyViolation))
        {
            return InUse(category.Name, await db.Items.CountAsync(i => i.CategoryId == n));
        }
        return NoContent();
    }

    private ConflictObjectResult InUse(string name, int count) =>
        Conflict(new InUseDto($"{name} is used by {count} {(count == 1 ? "item" : "items")} and cannot be deleted.", count));
}
