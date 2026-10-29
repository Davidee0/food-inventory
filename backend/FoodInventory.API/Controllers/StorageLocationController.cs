using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

// Fridge, Freezer and Pantry: a fixed list, so it can only be read.
[Route("api/[controller]")]
[ApiController]
public class StorageLocationController : ControllerBase
{
    protected StorageLocationRepository Repository { get; }

    public StorageLocationController(StorageLocationRepository repository)
    {
        Repository = repository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<StorageLocation>> GetStorageLocations()
    {
        return Ok(Repository.GetStorageLocations());
    }
}
