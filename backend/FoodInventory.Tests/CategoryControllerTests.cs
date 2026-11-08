using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Npgsql;

namespace FoodInventory.Tests;

// Unit tests for CategoryController (lecture 9), with a mocked repository.
public class CategoryControllerTests
{
    private readonly Mock<CategoryRepository> _repoMock;
    private readonly CategoryController _controller;

    public CategoryControllerTests()
    {
        _repoMock = new Mock<CategoryRepository>((IConfiguration?)null);
        _controller = new CategoryController(_repoMock.Object);
    }

    private static Category Dairy() => new(1) { Name = "Dairy" };

    [Fact]
    public void GetCategory_ReturnsOk_WhenCategoryExists()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(Dairy());

        var result = _controller.GetCategory(1);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void GetCategory_ReturnsNotFound_WhenCategoryDoesNotExist()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns((Category?)null);

        var result = _controller.GetCategory(1);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void GetCategories_ReturnsOk_WithListOfCategories()
    {
        _repoMock.Setup(r => r.GetCategories()).Returns(new List<Category> { Dairy(), new Category(2) { Name = "Fruit" } });

        var result = _controller.GetCategories();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void Post_ReturnsOk_WhenInsertSucceeds()
    {
        var dairy = Dairy();
        _repoMock.Setup(r => r.InsertCategory(dairy)).Returns(true);

        Assert.IsType<OkResult>(_controller.Post(dairy));
    }

    [Fact]
    public void UpdateCategory_ReturnsNotFound_WhenCategoryDoesNotExist()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns((Category?)null);

        Assert.IsType<NotFoundObjectResult>(_controller.UpdateCategory(Dairy()));
    }

    [Fact]
    public void DeleteCategory_ReturnsNoContent_WhenDeleteSucceeds()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(Dairy());
        _repoMock.Setup(r => r.DeleteCategory(1)).Returns(true);

        Assert.IsType<NoContentResult>(_controller.DeleteCategory(1));
    }

    // The database refuses to delete a category that still has food in it (foreign key);
    // the controller turns that into 409 Conflict with a message in plain language.
    [Fact]
    public void DeleteCategory_ReturnsConflict_WhenCategoryStillHasFood()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(Dairy());
        _repoMock.Setup(r => r.DeleteCategory(1))
            .Throws(new PostgresException("foreign key violation", "ERROR", "ERROR", PostgresErrorCodes.ForeignKeyViolation));

        var result = _controller.DeleteCategory(1);

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal("Dairy still has food in it, so it cannot be deleted.", conflict.Value);
    }
}
