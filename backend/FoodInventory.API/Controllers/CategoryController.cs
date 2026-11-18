using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace FoodInventory.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoryController : ControllerBase
{
    protected CategoryRepository Repository { get; }

    public CategoryController(CategoryRepository repository)
    {
        Repository = repository;
    }

    [HttpGet("{id}")]
    public ActionResult<Category> GetCategory([FromRoute] int id)
    {
        Category category = Repository.GetCategoryById(id);
        if (category == null)
        {
            return NotFound($"Category with id {id} not found");
        }
        return Ok(category);
    }

    [HttpGet]
    public ActionResult<IEnumerable<Category>> GetCategories()
    {
        return Ok(Repository.GetCategories());
    }

    [HttpPost]
    public ActionResult Post([FromBody] Category category)
    {
        Repository.InsertCategory(category);
        return Ok();
    }

    [HttpPut]
    public ActionResult UpdateCategory([FromBody] Category category)
    {
        if (Repository.GetCategoryById(category.Id) == null)
        {
            return NotFound($"Category with id {category.Id} not found");
        }
        Repository.UpdateCategory(category);
        return Ok();
    }

    // Business rule: a category that still has food in it cannot be deleted.
    // The foreign key in the database refuses the delete; the API turns that into 409 Conflict with a readable message.
    [HttpDelete("{id}")]
    public ActionResult DeleteCategory([FromRoute] int id)
    {
        Category category = Repository.GetCategoryById(id);
        if (category == null)
        {
            return NotFound($"Category with id {id} not found");
        }
        try
        {
            Repository.DeleteCategory(id);
            return NoContent();
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict($"{category.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
