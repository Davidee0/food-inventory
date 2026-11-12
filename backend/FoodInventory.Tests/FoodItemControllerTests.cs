using Xunit;
using Moq;
using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

// The tests from Lecture 9 (StudentControllerTests), for our FoodItemController.
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
    public void Post_ReturnsOk_WhenInsertSucceeds()
    {
        var foodItem = new FoodItem(1);
        _repoMock.Setup(r => r.InsertFoodItem(foodItem)).Returns(true);
        var result = _controller.Post(foodItem);
        Assert.IsType<OkResult>(result);
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
}
