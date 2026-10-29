using FoodInventory.Model.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ItemRepository>();
builder.Services.AddScoped<CategoryRepository>();
builder.Services.AddScoped<LocationRepository>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();

app.Run();
