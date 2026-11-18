using Xunit;
using Moq;
using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Npgsql;

// Lecture 9: the same tests as for StudentController, plus the 409 when the category still has food.
public class CategoryControllerTests
{
    private readonly Mock<CategoryRepository> _repoMock;
    private readonly CategoryController _controller;

    public CategoryControllerTests()
    {
        _repoMock = new Mock<CategoryRepository>(null);
        _controller = new CategoryController(_repoMock.Object);
    }

    [Fact]
    public void GetCategory_ReturnsOk_WhenCategoryExists()
    {
        var category = new Category(1) { Name = "Dairy" };
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(category);
        var result = _controller.GetCategory(1);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void GetCategory_ReturnsNotFound_WhenCategoryDoesNotExist()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns((Category)null);
        var result = _controller.GetCategory(1);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void GetCategories_ReturnsOk_WithListOfCategories()
    {
        var categories = new List<Category> { new Category(1), new Category(2) };
        _repoMock.Setup(r => r.GetCategories()).Returns(categories);
        var result = _controller.GetCategories();
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void Post_ReturnsBadRequest_WhenCategoryIsNull()
    {
        var result = _controller.Post(null);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void Post_ReturnsOk_WhenInsertSucceeds()
    {
        var category = new Category(0) { Name = "Snacks" };
        _repoMock.Setup(r => r.InsertCategory(category)).Returns(true);
        var result = _controller.Post(category);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void UpdateCategory_ReturnsNotFound_WhenCategoryDoesNotExist()
    {
        var category = new Category(1);
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns((Category)null);
        var result = _controller.UpdateCategory(category);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public void DeleteCategory_ReturnsNoContent_WhenDeleteSucceeds()
    {
        var category = new Category(1) { Name = "Dairy" };
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(category);
        _repoMock.Setup(r => r.DeleteCategory(1)).Returns(true);
        var result = _controller.DeleteCategory(1);
        Assert.IsType<NoContentResult>(result);
    }

    // The mock throws what PostgreSQL throws when a foreign key refuses the delete (error code 23503).
    [Fact]
    public void DeleteCategory_ReturnsConflict_WhenCategoryStillHasFood()
    {
        var category = new Category(1) { Name = "Dairy" };
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(category);
        _repoMock.Setup(r => r.DeleteCategory(1))
            .Throws(new PostgresException("still referenced", "ERROR", "ERROR", "23503"));
        var result = _controller.DeleteCategory(1);
        Assert.IsType<ConflictObjectResult>(result);
    }
}
