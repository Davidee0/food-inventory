using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

// Ids are numbers: {id:int} sends /api/Category/abc to a plain 404.
[Route("api/[controller]")]
[ApiController]
public class CategoryController(CategoryRepository repository) : ControllerBase
{
    // By name ignoring case, each with the number of items that use it.
    [HttpGet]
    public ActionResult<IEnumerable<Category>> GetCategories() => Ok(repository.GetCategories());

    [HttpGet("{id:int}")]
    public ActionResult<Category> GetCategory(int id) =>
        repository.GetCategoryById(id) is { } category ? Ok(category) : CategoryNotFound();

    // 201 Created, with a Location header that points to the new category.
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public ActionResult<Category> Post(CategoryRequest request)
    {
        if (CheckName(request, 0) is { } answer) return answer;
        var id = repository.InsertCategory(request.Name.Trim());
        return CreatedAtAction(nameof(GetCategory), new { id }, repository.GetCategoryById(id));
    }

    [HttpPut("{id:int}")]
    public ActionResult<Category> Put(int id, CategoryRequest request)
    {
        if (repository.GetCategoryById(id) is null) return CategoryNotFound();
        if (CheckName(request, id) is { } answer) return answer;
        repository.UpdateCategory(id, request.Name.Trim());
        return Ok(repository.GetCategoryById(id));
    }

    // A category that items still use cannot be deleted (the database refuses it too: ON DELETE RESTRICT).
    [HttpDelete("{id:int}")]
    public ActionResult Delete(int id)
    {
        if (repository.GetCategoryById(id) is not { } category) return CategoryNotFound();
        var n = category.ItemCount;
        if (n > 0)
            return Conflict(new { message = $"{category.Name} is used by {n} {(n == 1 ? "item" : "items")} and cannot be deleted.", itemCount = n });
        repository.DeleteCategory(id);
        return NoContent();
    }

    private NotFoundObjectResult CategoryNotFound() => NotFound(new { message = "Category not found." });

    // The 400 or 409 answer for a bad name, or null when the name can be saved (on the category with this id).
    private ActionResult CheckName(CategoryRequest request, int id)
    {
        if (Rules.Name(request.Name, 30) is { } error) return BadRequest(new { errors = new { name = error } });
        var name = request.Name.Trim();
        return repository.NameExists(name, id) ? Conflict(new { message = $"{name} already exists." }) : null;
    }
}
