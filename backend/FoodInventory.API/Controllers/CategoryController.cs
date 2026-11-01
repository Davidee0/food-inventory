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

    // GET api/Category/5
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

    // GET api/Category
    [HttpGet]
    public ActionResult<IEnumerable<Category>> GetCategories()
    {
        return Ok(Repository.GetCategories());
    }

    // POST api/Category
    [HttpPost]
    public ActionResult Post([FromBody] Category category)
    {
        bool status = Repository.InsertCategory(category);
        if (status)
        {
            return Ok();
        }
        return BadRequest();
    }

    // PUT api/Category (the whole category, id included)
    [HttpPut]
    public ActionResult UpdateCategory([FromBody] Category category)
    {
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

    // DELETE api/Category/5
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
        catch (PostgresException)
        {
            // The foreign key in food_item refuses the delete while food still has this category.
            return Conflict($"{existingCategory.Name} still has food in it, so it cannot be deleted.");
        }
    }
}
