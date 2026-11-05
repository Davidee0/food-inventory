using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodInventory.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoryController(CategoryRepository repository) : ControllerBase
{
    // By name ignoring case, each with the number of items that use it.
    [HttpGet]
    public ActionResult<IEnumerable<Category>> GetCategories() => Ok(repository.GetCategories());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Category> GetCategory(string id) => Find(id) is { } category ? Ok(category) : CategoryNotFound();

    // 201 Created, with a Location header that points to the new category.
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<Category> Post(CategoryRequest request)
    {
        if (CheckName(request, 0) is { } answer) return answer;
        var id = repository.InsertCategory(request.Name.Trim());
        return CreatedAtAction(nameof(GetCategory), new { id }, repository.GetCategoryById(id));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<Category> Put(string id, CategoryRequest request)
    {
        if (Find(id) is not { } category) return CategoryNotFound();
        if (CheckName(request, category.Id) is { } answer) return answer;
        repository.UpdateCategory(category.Id, request.Name.Trim());
        return Ok(repository.GetCategoryById(category.Id));
    }

    // A category that items still use cannot be deleted (the database refuses it too: ON DELETE RESTRICT).
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult Delete(string id)
    {
        if (Find(id) is not { } category) return CategoryNotFound();
        var n = category.ItemCount;
        if (n > 0)
            return Conflict(new { message = $"{category.Name} is used by {n} {(n == 1 ? "item" : "items")} and cannot be deleted.", itemCount = n });
        repository.DeleteCategory(category.Id);
        return NoContent();
    }

    private NotFoundObjectResult CategoryNotFound() => NotFound(new { message = "Category not found." });

    // A non-numeric id ("abc") is simply not found.
    private Category Find(string id) => int.TryParse(id, out var n) ? repository.GetCategoryById(n) : null;

    // The 400 or 409 answer for a bad name, or null when the name can be saved (on the category with this id).
    private ActionResult CheckName(CategoryRequest request, int id)
    {
        if (Rules.Name(request.Name, 30) is { } error) return BadRequest(new { errors = new { name = error } });
        var name = request.Name.Trim();
        return repository.NameExists(name, id) ? Conflict(new { message = $"{name} already exists." }) : null;
    }
}
