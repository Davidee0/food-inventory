using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

// The storage locations are a fixed list (Fridge, Freezer, Pantry), so they can only be read.
[Route("api/[controller]")]
[ApiController]
public class LocationController(LocationRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Location>> GetLocations() => Ok(repository.GetLocations());
}
