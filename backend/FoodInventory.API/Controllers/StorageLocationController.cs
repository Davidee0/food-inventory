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

    // GET api/StorageLocation/5
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

    // GET api/StorageLocation
    [HttpGet]
    public ActionResult<IEnumerable<StorageLocation>> GetStorageLocations()
    {
        return Ok(Repository.GetStorageLocations());
    }

    // POST api/StorageLocation
    [HttpPost]
    public ActionResult Post([FromBody] StorageLocation storageLocation)
    {
        bool status = Repository.InsertStorageLocation(storageLocation);
        if (status)
        {
            return Ok();
        }
        return BadRequest();
    }

    // PUT api/StorageLocation (the whole storage location, id included)
    [HttpPut]
    public ActionResult UpdateStorageLocation([FromBody] StorageLocation storageLocation)
    {
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

    // DELETE api/StorageLocation/5
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
        catch (PostgresException)
        {
            // The foreign key in food_item refuses the delete while food is still stored here.
            return Conflict($"{existingStorageLocation.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
