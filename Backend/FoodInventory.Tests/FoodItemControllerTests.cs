using Xunit;
using Moq;
using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

// The repository is mocked, so the tests need no database.
public class FoodItemControllerTests
{
    private readonly Mock<FoodItemRepository> _repoMock;
    private readonly FoodItemController _controller;

    public FoodItemControllerTests()
    {
        _repoMock = new Mock<FoodItemRepository>(null);
        _controller = new FoodItemController(_repoMock.Object);
    }

    [Fact]
    public void GetFoodItem_ReturnsOk_WhenFoodItemExists()
    {
        var foodItem = new FoodItem(1) { Name = "Milk" };
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(foodItem);
        var result = _controller.GetFoodItem(1);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void GetFoodItem_ReturnsNotFound_WhenFoodItemDoesNotExist()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns((FoodItem)null);
        var result = _controller.GetFoodItem(1);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void GetFoodItems_ReturnsOk_WithListOfFoodItems()
    {
        var foodItems = new List<FoodItem> { new FoodItem(1), new FoodItem(2) };
        _repoMock.Setup(r => r.GetFoodItems()).Returns(foodItems);
        var result = _controller.GetFoodItems();
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void Post_ReturnsBadRequest_WhenFoodItemIsNull()
    {
        var result = _controller.Post(null);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void Post_ReturnsOk_WhenInsertSucceeds()
    {
        var foodItem = new FoodItem(0) { Name = "Milk", Quantity = 1 };
        _repoMock.Setup(r => r.InsertFoodItem(foodItem)).Returns(true);
        var result = _controller.Post(foodItem);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void Post_ReturnsBadRequest_WhenBestBeforeDateIsBeforePurchaseDate()
    {
        var foodItem = new FoodItem(0)
        {
            Name = "Milk",
            PurchaseDate = new DateOnly(2026, 11, 10),
            BestBeforeDate = new DateOnly(2026, 11, 1)
        };
        var result = _controller.Post(foodItem);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void UpdateFoodItem_ReturnsNotFound_WhenFoodItemDoesNotExist()
    {
        var foodItem = new FoodItem(1);
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns((FoodItem)null);
        var result = _controller.UpdateFoodItem(foodItem);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public void DeleteFoodItem_ReturnsNoContent_WhenDeleteSucceeds()
    {
        var foodItem = new FoodItem(1);
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(foodItem);
        _repoMock.Setup(r => r.DeleteFoodItem(1)).Returns(true);
        var result = _controller.DeleteFoodItem(1);
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public void UpdateFoodItem_ReturnsOk_WhenUpdateSucceeds()
    {
        var foodItem = new FoodItem(1) { Name = "Milk", Quantity = 2 };
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(foodItem);
        _repoMock.Setup(r => r.UpdateFoodItem(foodItem)).Returns(true);
        var result = _controller.UpdateFoodItem(foodItem);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void UpdateFoodItem_ReturnsBadRequest_WhenBestBeforeDateIsBeforePurchaseDate()
    {
        var foodItem = new FoodItem(1)
        {
            Name = "Milk",
            PurchaseDate = new DateOnly(2026, 11, 10),
            BestBeforeDate = new DateOnly(2026, 11, 1)
        };
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns(foodItem);
        var result = _controller.UpdateFoodItem(foodItem);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void DeleteFoodItem_ReturnsNotFound_WhenFoodItemDoesNotExist()
    {
        _repoMock.Setup(r => r.GetFoodItemById(1)).Returns((FoodItem)null);
        var result = _controller.DeleteFoodItem(1);
        Assert.IsType<NotFoundObjectResult>(result);
    }
}
