using FoodInventory.API.Controllers;
using FoodInventory.Model.Entities;
using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Npgsql;

namespace FoodInventory.Tests;

// Unit tests for StorageLocationController (lecture 9), with a mocked repository.
public class StorageLocationControllerTests
{
    private readonly Mock<StorageLocationRepository> _repoMock;
    private readonly StorageLocationController _controller;

    public StorageLocationControllerTests()
    {
        _repoMock = new Mock<StorageLocationRepository>((IConfiguration?)null);
        _controller = new StorageLocationController(_repoMock.Object);
    }

    private static StorageLocation Fridge() => new(1) { Name = "Fridge" };

    [Fact]
    public void GetStorageLocations_ReturnsOk_WithListOfLocations()
    {
        _repoMock.Setup(r => r.GetStorageLocations()).Returns(new List<StorageLocation> { Fridge() });

        Assert.IsType<OkObjectResult>(_controller.GetStorageLocations().Result);
    }

    [Fact]
    public void DeleteStorageLocation_ReturnsNotFound_WhenLocationDoesNotExist()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns((StorageLocation?)null);

        Assert.IsType<NotFoundObjectResult>(_controller.DeleteStorageLocation(1));
    }

    [Fact]
    public void DeleteStorageLocation_ReturnsConflict_WhenLocationStillHasFood()
    {
        _repoMock.Setup(r => r.GetStorageLocationById(1)).Returns(Fridge());
        _repoMock.Setup(r => r.DeleteStorageLocation(1))
            .Throws(new PostgresException("foreign key violation", "ERROR", "ERROR", PostgresErrorCodes.ForeignKeyViolation));

        var conflict = Assert.IsType<ConflictObjectResult>(_controller.DeleteStorageLocation(1));
        Assert.Equal("Fridge still has food in it, so it cannot be deleted.", conflict.Value);
    }
}
