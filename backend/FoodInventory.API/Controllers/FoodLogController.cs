using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

// The history (US14). No PUT: a row is added by "Ate one" or "Threw one away" and can only be deleted.
[Route("api/[controller]")]
[ApiController]
public class FoodLogController : ControllerBase
{
    protected FoodLogRepository Repository { get; }

    public FoodLogController(FoodLogRepository repository)
    {
        Repository = repository;
    }

    // GET api/FoodLog/5
    [HttpGet("{id}")]
    public ActionResult<FoodLog> GetFoodLog([FromRoute] int id)
    {
        FoodLog foodLog = Repository.GetFoodLogById(id);
        if (foodLog == null)
        {
            return NotFound();
        }
        return Ok(foodLog);
    }

    // GET api/FoodLog
    [HttpGet]
    public ActionResult<IEnumerable<FoodLog>> GetFoodLogs()
    {
        return Ok(Repository.GetFoodLogs());
    }

    // POST api/FoodLog
    [HttpPost]
    public ActionResult Post([FromBody] FoodLog foodLog)
    {
        bool status = Repository.InsertFoodLog(foodLog);
        if (status)
        {
            return Ok();
        }
        return BadRequest();
    }

    // DELETE api/FoodLog/5
    [HttpDelete("{id}")]
    public ActionResult DeleteFoodLog([FromRoute] int id)
    {
        FoodLog existingFoodLog = Repository.GetFoodLogById(id);
        if (existingFoodLog == null)
        {
            return NotFound($"Food log with id {id} not found");
        }
        bool status = Repository.DeleteFoodLog(id);
        if (status)
        {
            return NoContent();
        }
        return BadRequest($"Unable to delete food log with id {id}");
    }
}
