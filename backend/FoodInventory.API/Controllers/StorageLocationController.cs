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
        StorageLocation storageLocation = Repository.GetStorageLocationById(id);
        if (storageLocation == null)
        {
            return NotFound($"Storage location with id {id} not found");
        }
        return Ok(storageLocation);
    }

    [HttpGet]
    public ActionResult<IEnumerable<StorageLocation>> GetStorageLocations()
    {
        return Ok(Repository.GetStorageLocations());
    }

    [HttpPost]
    public ActionResult Post([FromBody] StorageLocation storageLocation)
    {
        Repository.InsertStorageLocation(storageLocation);
        return Ok();
    }

    [HttpPut]
    public ActionResult UpdateStorageLocation([FromBody] StorageLocation storageLocation)
    {
        if (Repository.GetStorageLocationById(storageLocation.Id) == null)
        {
            return NotFound($"Storage location with id {storageLocation.Id} not found");
        }
        Repository.UpdateStorageLocation(storageLocation);
        return Ok();
    }

    // Business rule: a storage location that still has food in it cannot be deleted.
    // The foreign key in the database refuses the delete; the API turns that into 409 Conflict with a readable message.
    [HttpDelete("{id}")]
    public ActionResult DeleteStorageLocation([FromRoute] int id)
    {
        StorageLocation storageLocation = Repository.GetStorageLocationById(id);
        if (storageLocation == null)
        {
            return NotFound($"Storage location with id {id} not found");
        }
        try
        {
            Repository.DeleteStorageLocation(id);
            return NoContent();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict($"{storageLocation.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
