using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;

namespace FoodInventory.Tests;

// Unit tests for FoodItemController (lecture 9). The repository is a mock (Moq), so no database is needed:
// each test says what the repository answers (Arrange), calls the controller (Act) and checks the result (Assert).
public class FoodItemControllerTests
{
    private readonly Mock<FoodItemRepository> _repoMock;
    private readonly FoodItemController _controller;

    public FoodItemControllerTests()
    {
        _repoMock = new Mock<FoodItemRepository>((IConfiguration?)null);
        _controller = new FoodItemController(_repoMock.Object);
    }

    private static FoodItem Milk() => new(1)
    {
        Name = "Milk",
        Quantity = 1,
        PurchaseDate = new DateOnly(2026, 11, 1),
        StorageLocationId = 1,
    };

    [Fact]
    public void GetFoodItem_ReturnsOk_WhenFoodItemExists()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(Milk());

        var result = _controller.GetFoodItem(1);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal("Milk", Assert.IsType<FoodItem>(ok.Value).Name);
    }

    [Fact]
    public void GetFoodItem_ReturnsNotFound_WhenFoodItemDoesNotExist()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns((FoodItem?)null);

        var result = _controller.GetFoodItem(1);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void GetFoodItems_ReturnsOk_WithListOfFoodItems()
    {
        _repoMock.Setup(r => r.GetFoodItems()).Returns(new List<FoodItem> { Milk(), new FoodItem(2) });

        var result = _controller.GetFoodItems();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(2, Assert.IsAssignableFrom<IEnumerable<FoodItem>>(ok.Value).Count());
    }

    [Fact]
    public void Post_ReturnsOk_WhenInsertSucceeds()
    {
        var milk = Milk();
        _repoMock.Setup(r => r.InsertFoodItem(milk)).Returns(true);

        var result = _controller.Post(milk);

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void UpdateFoodItem_ReturnsOk_WhenUpdateSucceeds()
    {
        var milk = Milk();
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(milk);
        _repoMock.Setup(r => r.UpdateFoodItem(milk)).Returns(true);

        var result = _controller.UpdateFoodItem(milk);

        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void UpdateFoodItem_ReturnsNotFound_WhenFoodItemDoesNotExist()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns((FoodItem?)null);

        var result = _controller.UpdateFoodItem(Milk());

        Assert.IsType<NotFoundObjectResult>(result);
        _repoMock.Verify(r => r.UpdateFoodItem(It.IsAny<FoodItem>()), Times.Never); // nothing is changed
    }

    [Fact]
    public void DeleteFoodItem_ReturnsNoContent_WhenDeleteSucceeds()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(Milk());
        _repoMock.Setup(r => r.DeleteFoodItem(1)).Returns(true);

        var result = _controller.DeleteFoodItem(1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public void DeleteFoodItem_ReturnsNotFound_WhenFoodItemDoesNotExist()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns((FoodItem?)null);

        var result = _controller.DeleteFoodItem(1);

        Assert.IsType<NotFoundObjectResult>(result);
        _repoMock.Verify(r => r.DeleteFoodItem(It.IsAny<int>()), Times.Never);
    }
}
