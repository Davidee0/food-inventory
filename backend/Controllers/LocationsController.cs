using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

// Storage locations (Fridge, Freezer, Pantry, ...): list, add, rename and delete, like the categories.
// Names are unique ignoring case. A location that still holds items cannot be deleted.
[ApiController]
[Route("locations")]
public class LocationsController(AppDbContext db) : ControllerBase
{
    private NotFoundObjectResult NotFoundMessage() => NotFound(new { message = "Location not found." });

    [HttpGet]
    public Task<List<LocationDto>> List() => db.Locations
        .OrderBy(l => l.Id)
        .Select(l => new LocationDto(l.Id, l.Name, db.Items.Count(i => i.LocationId == l.Id)))
        .ToListAsync();

    [HttpPost]
    public async Task<IActionResult> Create(LocationRequest request)
    {
        if (await CheckName(request, 0) is { } answer) return answer;
        var location = new Location { Name = request.Name!.Trim() };
        db.Locations.Add(location);
        await db.SaveChangesAsync();
        return Created($"/locations/{location.Id}", new LocationDto(location.Id, location.Name, 0));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Rename(string id, LocationRequest request)
    {
        if (await Find(id) is not { } location) return NotFoundMessage();
        if (await CheckName(request, location.Id) is { } answer) return answer;
        location.Name = request.Name!.Trim();
        await db.SaveChangesAsync();
        return Ok(new { location.Id, location.Name });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (await Find(id) is not { } location) return NotFoundMessage();
        var n = await db.Items.CountAsync(i => i.LocationId == location.Id);
        if (n > 0) return Conflict(new InUseDto($"{location.Name} holds {n} {(n == 1 ? "item" : "items")} and cannot be deleted.", n));
        db.Locations.Remove(location);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<Location?> Find(string id) => int.TryParse(id, out var n) ? await db.Locations.FindAsync(n) : null;

    // The 400 or 409 answer for a bad name, or null when the name can be saved (on the location with this id).
    // The list is short, so the names are compared here in C#: ToLowerInvariant also handles Æ, Ø and Å.
    private async Task<IActionResult?> CheckName(LocationRequest request, int id)
    {
        if (Rules.Name(request.Name, 30) is { } error) return BadRequest(new { errors = new { name = error } });
        var name = request.Name!.Trim();
        var key = name.ToLowerInvariant();
        var names = await db.Locations.Where(l => l.Id != id).Select(l => l.Name).ToListAsync();
        return names.Any(n => n.ToLowerInvariant() == key) ? Conflict(new { message = $"{name} already exists." }) : null;
    }
}
