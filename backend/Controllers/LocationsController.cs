using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

[ApiController]
[Route("locations")]
public class LocationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LocationDto>>> List() =>
        await db.Locations.OrderBy(l => l.Id).Select(l => new LocationDto(l.Id, l.Name)).ToListAsync();
}
