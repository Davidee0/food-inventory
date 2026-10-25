using System.Reflection;
using System.Text.Json;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FoodInventory.Api.Swagger;

public class JsonBodyOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var body = context.MethodInfo.GetCustomAttribute<JsonBodyAttribute>();
        if (body is null) return;

        using var example = JsonDocument.Parse(body.Example);
        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content =
            {
                ["application/json"] = new OpenApiMediaType
                {
                    Schema = context.SchemaGenerator.GenerateSchema(body.Type, context.SchemaRepository),
                    Example = ToOpenApi(example.RootElement),
                },
            },
        };
    }

    private static IOpenApiAny ToOpenApi(JsonElement e)
    {
        switch (e.ValueKind)
        {
            case JsonValueKind.Object:
                var obj = new OpenApiObject();
                foreach (var p in e.EnumerateObject()) obj[p.Name] = ToOpenApi(p.Value);
                return obj;
            case JsonValueKind.Array:
                var arr = new OpenApiArray();
                foreach (var v in e.EnumerateArray()) arr.Add(ToOpenApi(v));
                return arr;
            case JsonValueKind.String: return new OpenApiString(e.GetString());
            case JsonValueKind.Number: return e.TryGetInt32(out var i) ? new OpenApiInteger(i) : new OpenApiDouble(e.GetDouble());
            case JsonValueKind.True: return new OpenApiBoolean(true);
            case JsonValueKind.False: return new OpenApiBoolean(false);
            default: return new OpenApiNull();
        }
    }
}
