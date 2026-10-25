namespace FoodInventory.Api.Swagger;

/// <summary>
/// Documents the JSON request body of an action in Swagger. The controllers read the raw body themselves
/// (to reject wrongly typed values), so there is no bound parameter for Swagger to describe.
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class JsonBodyAttribute(Type type, string example) : Attribute
{
    public Type Type { get; } = type;
    public string Example { get; } = example;
}
