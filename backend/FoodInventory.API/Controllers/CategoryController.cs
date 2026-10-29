using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

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
        Category? category = Repository.GetCategoryById(id);
        if (category == null) return NotFound();
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
        return Repository.InsertCategory(category) ? Ok() : BadRequest();
    }

    [HttpPut]
    public ActionResult UpdateCategory([FromBody] Category category)
    {
        if (Repository.GetCategoryById(category.Id) == null) return NotFound($"Category with id {category.Id} not found");
        return Repository.UpdateCategory(category) ? Ok() : BadRequest("Something went wrong");
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteCategory([FromRoute] int id)
    {
        if (Repository.GetCategoryById(id) == null) return NotFound($"Category with id {id} not found");
        return Repository.DeleteCategory(id) ? NoContent() : BadRequest($"Unable to delete category with id {id}");
    }
}
