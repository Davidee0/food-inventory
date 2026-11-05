using FoodInventory.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<LocationRepository, LocationRepository>();
builder.Services.AddScoped<CategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ItemRepository, ItemRepository>();

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(o =>
    {
        // Malformed JSON or a wrongly typed value (e.g. a number as name) never reaches a controller.
        o.InvalidModelStateResponseFactory = _ => new BadRequestObjectResult(new { message = "The request body is not valid JSON." });
        // Errors here are {message} or {errors}, not ASP.NET's ProblemDetails, so Swagger must not describe them as ProblemDetails.
        o.SuppressMapClientErrors = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// The Angular app (ng serve) runs on another port, so the browser needs permission to call the API.
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler(error => error.Run(context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    return context.Response.WriteAsJsonAsync(new { message = "Something went wrong on the server." });
}));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
