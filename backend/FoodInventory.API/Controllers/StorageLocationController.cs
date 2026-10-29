using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace FoodInventory.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StorageLocationController : ControllerBase
{
    protected StorageLocationRepository Repository { get; }

    public StorageLocationController(StorageLocationRepository repository)
    {
        Repository = repository;
    }

    [HttpGet("{id}")]
    public ActionResult<StorageLocation> GetStorageLocation([FromRoute] int id)
    {
        StorageLocation? location = Repository.GetStorageLocationById(id);
        if (location == null) return NotFound();
        return Ok(location);
    }

    [HttpGet]
    public ActionResult<IEnumerable<StorageLocation>> GetStorageLocations()
    {
        return Ok(Repository.GetStorageLocations());
    }

    [HttpPost]
    public ActionResult Post([FromBody] StorageLocation location)
    {
        return Repository.InsertStorageLocation(location) ? Ok() : BadRequest();
    }

    [HttpPut]
    public ActionResult UpdateStorageLocation([FromBody] StorageLocation location)
    {
        if (Repository.GetStorageLocationById(location.Id) == null) return NotFound($"Storage location with id {location.Id} not found");
        return Repository.UpdateStorageLocation(location) ? Ok() : BadRequest("Something went wrong");
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteStorageLocation([FromRoute] int id)
    {
        StorageLocation? location = Repository.GetStorageLocationById(id);
        if (location == null) return NotFound($"Storage location with id {id} not found");
        try
        {
            return Repository.DeleteStorageLocation(id) ? NoContent() : BadRequest($"Unable to delete storage location with id {id}");
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict($"{location.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
