using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace FoodInventory.API.Controllers;

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
            return NotFound();
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
        if (foodItem == null)
        {
            return BadRequest("Food item info not correct");
        }
        // Data annotations check one field at a time, so the rule that compares two dates is here.
        if (foodItem.BestBeforeDate < foodItem.PurchaseDate)
        {
            return BadRequest("Best before date cannot be before the purchase date");
        }
        try
        {
            bool status = Repository.InsertFoodItem(foodItem);
            if (status)
            {
                return Ok();
            }
            return BadRequest();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("Category or storage location does not exist");
        }
    }

    // The whole food item is in the body, id included.
    [HttpPut]
    public ActionResult UpdateFoodItem([FromBody] FoodItem foodItem)
    {
        if (foodItem == null)
        {
            return BadRequest("Food item info not correct");
        }
        FoodItem existingFoodItem = Repository.GetFoodItemById(foodItem.Id);
        if (existingFoodItem == null)
        {
            return NotFound($"Food item with id {foodItem.Id} not found");
        }
        if (foodItem.BestBeforeDate < foodItem.PurchaseDate)
        {
            return BadRequest("Best before date cannot be before the purchase date");
        }
        try
        {
            bool status = Repository.UpdateFoodItem(foodItem);
            if (status)
            {
                return Ok();
            }
            return BadRequest("Something went wrong");
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest("Category or storage location does not exist");
        }
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteFoodItem([FromRoute] int id)
    {
        FoodItem existingFoodItem = Repository.GetFoodItemById(id);
        if (existingFoodItem == null)
        {
            return NotFound($"Food item with id {id} not found");
        }
        bool status = Repository.DeleteFoodItem(id);
        if (status)
        {
            return NoContent();
        }
        return BadRequest($"Unable to delete food item with id {id}");
    }
}
