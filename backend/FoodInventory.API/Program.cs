using FoodInventory.Model.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// One repository per table, given to the controllers through dependency injection (Lecture 4).
builder.Services.AddScoped<FoodItemRepository, FoodItemRepository>();
builder.Services.AddScoped<CategoryRepository, CategoryRepository>();
builder.Services.AddScoped<StorageLocationRepository, StorageLocationRepository>();
builder.Services.AddScoped<FoodLogRepository, FoodLogRepository>();

builder.Services.AddControllers();
// Swagger: try the endpoints on http://localhost:5050/swagger (Lecture 4).
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); removed to avoid HTTPS/certificate issues (Lecture 4)

// Lets the Angular app on http://localhost:4200 call this API (Lecture 6).
app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

app.UseAuthorization();

app.MapControllers();

app.Run();
