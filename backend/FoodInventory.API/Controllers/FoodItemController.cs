using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

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

    // GET api/FoodItem/5
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

    // GET api/FoodItem
    [HttpGet]
    public ActionResult<IEnumerable<FoodItem>> GetFoodItems()
    {
        return Ok(Repository.GetFoodItems());
    }

    // POST api/FoodItem
    [HttpPost]
    public ActionResult Post([FromBody] FoodItem foodItem)
    {
        if (foodItem.BestBeforeDate < foodItem.PurchaseDate)
        {
            return BadRequest("Best before date cannot be before the purchase date");
        }
        bool status = Repository.InsertFoodItem(foodItem);
        if (status)
        {
            return Ok();
        }
        return BadRequest();
    }

    // PUT api/FoodItem (the whole food item, id included)
    [HttpPut]
    public ActionResult UpdateFoodItem([FromBody] FoodItem foodItem)
    {
        FoodItem existingFoodItem = Repository.GetFoodItemById(foodItem.Id);
        if (existingFoodItem == null)
        {
            return NotFound($"Food item with id {foodItem.Id} not found");
        }
        if (foodItem.BestBeforeDate < foodItem.PurchaseDate)
        {
            return BadRequest("Best before date cannot be before the purchase date");
        }
        bool status = Repository.UpdateFoodItem(foodItem);
        if (status)
        {
            return Ok();
        }
        return BadRequest("Something went wrong");
    }

    // DELETE api/FoodItem/5
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
