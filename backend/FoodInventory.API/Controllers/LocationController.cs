using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

// Fridge, Freezer and Pantry: a fixed list, so it can only be read.
[Route("api/[controller]")]
[ApiController]
public class LocationController : ControllerBase
{
    protected LocationRepository Repository { get; }

    public LocationController(LocationRepository repository)
    {
        Repository = repository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Location>> GetLocations()
    {
        return Ok(Repository.GetLocations());
    }
}
