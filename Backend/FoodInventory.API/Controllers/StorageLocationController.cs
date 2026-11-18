using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace FoodInventory.API.Controllers;

// Like TeacherController (Exercise 6.2): /api/StorageLocation
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
            return NotFound();
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
        if (storageLocation == null)
        {
            return BadRequest("Storage location info not correct");
        }
        bool status = Repository.InsertStorageLocation(storageLocation);
        if (status)
        {
            return Ok();
        }
        return BadRequest();
    }

    [HttpPut]
    public ActionResult UpdateStorageLocation([FromBody] StorageLocation storageLocation)
    {
        if (storageLocation == null)
        {
            return BadRequest("Storage location info not correct");
        }
        StorageLocation existingStorageLocation = Repository.GetStorageLocationById(storageLocation.Id);
        if (existingStorageLocation == null)
        {
            return NotFound($"Storage location with id {storageLocation.Id} not found");
        }
        bool status = Repository.UpdateStorageLocation(storageLocation);
        if (status)
        {
            return Ok();
        }
        return BadRequest("Something went wrong");
    }

    // Business rule: a storage location that still has food in it cannot be deleted.
    // The foreign key in the database refuses the delete; the API turns that into 409 Conflict with a readable message.
    [HttpDelete("{id}")]
    public ActionResult DeleteStorageLocation([FromRoute] int id)
    {
        StorageLocation existingStorageLocation = Repository.GetStorageLocationById(id);
        if (existingStorageLocation == null)
        {
            return NotFound($"Storage location with id {id} not found");
        }
        try
        {
            bool status = Repository.DeleteStorageLocation(id);
            if (status)
            {
                return NoContent();
            }
            return BadRequest($"Unable to delete storage location with id {id}");
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict($"{existingStorageLocation.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
