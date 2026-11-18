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
            return NotFound();
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
        if (category == null)
        {
            return BadRequest("Category info not correct");
        }
        bool status = Repository.InsertCategory(category);
        if (status)
        {
            return Ok();
        }
        return BadRequest();
    }

    [HttpPut]
    public ActionResult UpdateCategory([FromBody] Category category)
    {
        if (category == null)
        {
            return BadRequest("Category info not correct");
        }
        Category existingCategory = Repository.GetCategoryById(category.Id);
        if (existingCategory == null)
        {
            return NotFound($"Category with id {category.Id} not found");
        }
        bool status = Repository.UpdateCategory(category);
        if (status)
        {
            return Ok();
        }
        return BadRequest("Something went wrong");
    }

    // The foreign key refuses the delete while food is still in it; the API answers 409.
    [HttpDelete("{id}")]
    public ActionResult DeleteCategory([FromRoute] int id)
    {
        Category existingCategory = Repository.GetCategoryById(id);
        if (existingCategory == null)
        {
            return NotFound($"Category with id {id} not found");
        }
        try
        {
            bool status = Repository.DeleteCategory(id);
            if (status)
            {
                return NoContent();
            }
            return BadRequest($"Unable to delete category with id {id}");
        }
        catch (PostgresException e) when (e.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return Conflict($"{existingCategory.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
