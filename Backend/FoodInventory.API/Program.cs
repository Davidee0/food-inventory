using FoodInventory.Model.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Lecture 4: dependency injection. Each controller gets its repository in the constructor.
builder.Services.AddScoped<FoodItemRepository, FoodItemRepository>();
builder.Services.AddScoped<CategoryRepository, CategoryRepository>();
builder.Services.AddScoped<StorageLocationRepository, StorageLocationRepository>();

var app = builder.Build();

// Lecture 4 and 10: Swagger only while developing (the launch profile in launchSettings.json sets Development).
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Lecture 6: the Angular app runs on another port (4200), so the browser asks the API for permission (CORS).
// The lecture allows any origin; here only the Angular app may call the API (narrower, as Lecture 10's security part advises).
app.UseCors(policy => policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod());

app.UseAuthorization();

app.MapControllers();

app.Run();
