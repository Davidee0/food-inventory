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

    [HttpGet("{id}")]
    public ActionResult<FoodItem> GetFoodItem([FromRoute] int id)
    {
        FoodItem? foodItem = Repository.GetFoodItemById(id);
        if (foodItem == null) return NotFound();
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
        return Repository.InsertFoodItem(foodItem) ? Ok() : BadRequest();
    }

    [HttpPut]
    public ActionResult UpdateFoodItem([FromBody] FoodItem foodItem)
    {
        if (Repository.GetFoodItemById(foodItem.Id) == null) return NotFound($"Food item with id {foodItem.Id} not found");
        return Repository.UpdateFoodItem(foodItem) ? Ok() : BadRequest("Something went wrong");
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteFoodItem([FromRoute] int id)
    {
        if (Repository.GetFoodItemById(id) == null) return NotFound($"Food item with id {id} not found");
        return Repository.DeleteFoodItem(id) ? NoContent() : BadRequest($"Unable to delete food item with id {id}");
    }
}
