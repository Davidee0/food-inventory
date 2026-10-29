using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

// Names are unique ignoring case through name_key, the lower-case copy (also for Æ, Ø and Å).
[ApiController]
[Route("categories")]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    private NotFoundObjectResult NotFoundMessage() => NotFound(new { message = "Category not found." });

    [HttpGet]
    public Task<List<CategoryDto>> List() => db.Categories
        .OrderBy(c => c.Name.ToLower()).ThenBy(c => c.Id)
        .Select(c => new CategoryDto(c.Id, c.Name, db.Items.Count(i => i.CategoryId == c.Id)))
        .ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Create(CategoryRequest request)
    {
        if (await CheckName(request, 0) is { } answer) return answer;
        var name = request.Name!.Trim();
        var category = new Category { Name = name, NameKey = name.ToLowerInvariant() };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return Created($"/categories/{category.Id}", new CategoryDto(category.Id, name, 0));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Rename(string id, CategoryRequest request)
    {
        if (await Find(id) is not { } category) return NotFoundMessage();
        if (await CheckName(request, category.Id) is { } answer) return answer;
        category.Name = request.Name!.Trim();
        category.NameKey = category.Name.ToLowerInvariant();
        await db.SaveChangesAsync();
        return Ok(new { category.Id, category.Name });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (await Find(id) is not { } category) return NotFoundMessage();
        var n = await db.Items.CountAsync(i => i.CategoryId == category.Id);
        if (n > 0) return Conflict(new { message = $"{category.Name} is used by {n} {(n == 1 ? "item" : "items")} and cannot be deleted." });
        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<Category?> Find(string id) => int.TryParse(id, out var n) ? await db.Categories.FindAsync(n) : null;

    // The 400 or 409 answer for a bad name, or null when the name can be saved (on the category with this id).
    private async Task<IActionResult?> CheckName(CategoryRequest request, int id)
    {
        if (Rules.Name(request.Name, 30) is { } error) return BadRequest(new { errors = new { name = error } });
        var name = request.Name!.Trim();
        var key = name.ToLowerInvariant();
        return await db.Categories.AnyAsync(c => c.NameKey == key && c.Id != id) ? Conflict(new { message = $"{name} already exists." }) : null;
    }
}
