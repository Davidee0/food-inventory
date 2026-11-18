using Xunit;
using Moq;
using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

public class StorageLocationControllerTests
{
    private readonly Mock<StorageLocationRepository> _repoMock;
    private readonly StorageLocationController _controller;

    public StorageLocationControllerTests()
    {
        _repoMock = new Mock<StorageLocationRepository>(null);
        _controller = new StorageLocationController(_repoMock.Object);
    }

    [Fact]
    public void GetStorageLocation_ReturnsOk_WhenStorageLocationExists()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(new StorageLocation(1) { Name = "Fridge" });
        var result = _controller.GetStorageLocation(1);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void GetStorageLocation_ReturnsNotFound_WhenStorageLocationDoesNotExist()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns((StorageLocation)null);
        var result = _controller.GetStorageLocation(1);
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public void DeleteStorageLocation_ReturnsNoContent_WhenStorageLocationIsEmpty()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(new StorageLocation(1) { Name = "Fridge" });
        _repoMock.Setup(r => r.DeleteStorageLocation(1)).Returns(true);
        var result = _controller.DeleteStorageLocation(1);
        Assert.IsType<NoContentResult>(result);
    }

    // The mock throws what PostgreSQL throws when a foreign key refuses the delete (error code 23503).
    [Fact]
    public void DeleteStorageLocation_ReturnsConflict_WhenStorageLocationStillHasFood()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(new StorageLocation(1) { Name = "Fridge" });
        _repoMock.Setup(r => r.DeleteStorageLocation(1)).Throws(new PostgresException("still referenced", "ERROR", "ERROR", "23503"));
        var result = _controller.DeleteStorageLocation(1);
        Assert.IsType<ConflictObjectResult>(result);
    }
}
