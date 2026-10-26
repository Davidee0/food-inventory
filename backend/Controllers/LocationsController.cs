using FoodInventory.Api.Data;
using FoodInventory.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodInventory.Api.Controllers;

// The storage locations are a fixed list (Fridge, Freezer, Pantry), so they can only be read.
[ApiController]
[Route("locations")]
public class LocationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public Task<List<Location>> List() => db.Locations.OrderBy(l => l.Id).ToListAsync();
}
