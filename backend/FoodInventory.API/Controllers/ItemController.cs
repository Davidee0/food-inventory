using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ItemController : ControllerBase
{
    protected ItemRepository Repository { get; }

    public ItemController(ItemRepository repository)
    {
        Repository = repository;
    }

    [HttpGet("{id}")]
    public ActionResult<Item> GetItem([FromRoute] int id)
    {
        Item? item = Repository.GetItemById(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet]
    public ActionResult<IEnumerable<Item>> GetItems()
    {
        return Ok(Repository.GetItems());
    }

    [HttpPost]
    public ActionResult Post([FromBody] Item item)
    {
        return Repository.InsertItem(item) ? Ok() : BadRequest();
    }

    [HttpPut]
    public ActionResult UpdateItem([FromBody] Item item)
    {
        if (Repository.GetItemById(item.Id) == null) return NotFound($"Item with id {item.Id} not found");
        return Repository.UpdateItem(item) ? Ok() : BadRequest("Something went wrong");
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteItem([FromRoute] int id)
    {
        if (Repository.GetItemById(id) == null) return NotFound($"Item with id {id} not found");
        return Repository.DeleteItem(id) ? NoContent() : BadRequest($"Unable to delete item with id {id}");
    }
}
