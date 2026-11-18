using Xunit;
using Moq;
using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
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
        var storageLocation = new StorageLocation(1) { Name = "Fridge" };
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(storageLocation);
        var result = _controller.GetStorageLocation(1);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void GetStorageLocation_ReturnsNotFound_WhenStorageLocationDoesNotExist()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns((StorageLocation)null);
        var result = _controller.GetStorageLocation(1);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public void GetStorageLocations_ReturnsOk_WithListOfStorageLocations()
    {
        var storageLocations = new List<StorageLocation> { new StorageLocation(1), new StorageLocation(2) };
        _repoMock.Setup(r => r.GetStorageLocations()).Returns(storageLocations);
        var result = _controller.GetStorageLocations();
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public void Post_ReturnsBadRequest_WhenStorageLocationIsNull()
    {
        var result = _controller.Post(null);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void Post_ReturnsOk_WhenInsertSucceeds()
    {
        var storageLocation = new StorageLocation(0) { Name = "Balcony" };
        _repoMock.Setup(r => r.InsertStorageLocation(storageLocation)).Returns(true);
        var result = _controller.Post(storageLocation);
        Assert.IsType<OkResult>(result);
    }

    [Fact]
    public void UpdateStorageLocation_ReturnsNotFound_WhenStorageLocationDoesNotExist()
    {
        var storageLocation = new StorageLocation(1);
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns((StorageLocation)null);
        var result = _controller.UpdateStorageLocation(storageLocation);
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public void DeleteStorageLocation_ReturnsNoContent_WhenDeleteSucceeds()
    {
        var storageLocation = new StorageLocation(1) { Name = "Fridge" };
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(storageLocation);
        _repoMock.Setup(r => r.DeleteStorageLocation(1)).Returns(true);
        var result = _controller.DeleteStorageLocation(1);
        Assert.IsType<NoContentResult>(result);
    }

    // The mock throws what PostgreSQL throws when a foreign key refuses the delete (error code 23503).
    [Fact]
    public void DeleteStorageLocation_ReturnsConflict_WhenStorageLocationStillHasFood()
    {
        var storageLocation = new StorageLocation(1) { Name = "Fridge" };
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(storageLocation);
        _repoMock.Setup(r => r.DeleteStorageLocation(1))
            .Throws(new PostgresException("still referenced", "ERROR", "ERROR", "23503"));
        var result = _controller.DeleteStorageLocation(1);
        Assert.IsType<ConflictObjectResult>(result);
    }
}
