using System.Text.Json;
using System.Text.Json.Serialization;
using FoodInventory.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower; // PurchaseDate <-> purchase_date
        o.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString; // "1" is accepted as an id
    })
    // Malformed JSON or a wrongly typed value (e.g. a number as name) never reaches a controller.
    .ConfigureApiBehaviorOptions(o => o.InvalidModelStateResponseFactory = _ =>
        new BadRequestObjectResult(new { message = "The request body is not valid JSON." }));
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler(error => error.Run(context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    return context.Response.WriteAsJsonAsync(new { message = "Something went wrong on the server." });
}));
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();

app.Run();

public partial class Program; // lets the tests start the API
