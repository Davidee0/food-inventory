using Xunit;
using Moq;
using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

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
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(new Category(1) { Name = "Dairy" });
        var result = _controller.GetCategory(1);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void GetCategory_ReturnsNotFound_WhenCategoryDoesNotExist()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns((Category)null);
        var result = _controller.GetCategory(1);
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public void DeleteCategory_ReturnsNoContent_WhenCategoryIsEmpty()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(new Category(1) { Name = "Dairy" });
        _repoMock.Setup(r => r.DeleteCategory(1)).Returns(true);
        var result = _controller.DeleteCategory(1);
        Assert.IsType<NoContentResult>(result);
    }

    // The mock throws what PostgreSQL throws when a foreign key refuses the delete (error code 23503).
    [Fact]
    public void DeleteCategory_ReturnsConflict_WhenCategoryStillHasFood()
    {
        _repoMock.Setup(r => r.GetCategoryById(1)).Returns(new Category(1) { Name = "Dairy" });
        _repoMock.Setup(r => r.DeleteCategory(1))
            .Throws(new PostgresException("still referenced", "ERROR", "ERROR", "23503"));
        var result = _controller.DeleteCategory(1);
        Assert.IsType<ConflictObjectResult>(result);
    }
}
