using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace FoodInventory.API.Controllers;

// Lecture 4: a Web API is consumed by systems (here the Angular app and Swagger). The data travels as JSON.
[Route("api/[controller]")]
[ApiController]
public class FoodItemController : ControllerBase
{
    protected FoodItemRepository Repository { get; }

    public FoodItemController(FoodItemRepository repository)
    {
        Repository = repository;
    }

    [HttpGet("{id}")]
    public ActionResult<FoodItem> GetFoodItem([FromRoute] int id)
    {
        FoodItem foodItem = Repository.GetFoodItemById(id);
        if (foodItem == null)
        {
            return NotFound($"Food item with id {id} not found");
        }
        return Ok(foodItem);
    }

    [HttpGet]
    public ActionResult<IEnumerable<FoodItem>> GetFoodItems()
    {
        return Ok(Repository.GetFoodItems());
    }

    [HttpPost]
    public ActionResult Post([FromBody] FoodItem foodItem)
    {
        // Business rule that compares two fields (Lecture 7: cross field validation).
        if (foodItem.BestBeforeDate < foodItem.PurchaseDate)
        {
            return BadRequest("Best before date cannot be before the purchase date");
        }
        try
        {
            Repository.InsertFoodItem(foodItem);
            return Ok();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("Category or storage location does not exist");
        }
    }

    // PUT updates a resource: the whole food item is in the body, id included.
    [HttpPut]
    public ActionResult UpdateFoodItem([FromBody] FoodItem foodItem)
    {
        if (Repository.GetFoodItemById(foodItem.Id) == null)
        {
            return NotFound($"Food item with id {foodItem.Id} not found");
        }
        if (foodItem.BestBeforeDate < foodItem.PurchaseDate)
        {
            return BadRequest("Best before date cannot be before the purchase date");
        }
        try
        {
            Repository.UpdateFoodItem(foodItem);
            return Ok();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("Category or storage location does not exist");
        }
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteFoodItem([FromRoute] int id)
    {
        if (Repository.GetFoodItemById(id) == null)
        {
            return NotFound($"Food item with id {id} not found");
        }
        Repository.DeleteFoodItem(id);
        return NoContent();
    }
}
