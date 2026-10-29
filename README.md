# Food inventory

Track the food you have at home: add groceries when you buy them, delete them when they are used up. No login: one shared inventory.
CBS course project (Designing and Developing Digital Business Applications): PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22.

## Run

1. **Database:** in pgAdmin, create the database `food_inventory`, open the Query Tool on it and run `database.sql`.
2. **Backend:** check the connection string `AppProgDb` in `backend/FoodInventory.API/appsettings.json`, then run `dotnet run --project backend/FoodInventory.API`.
   The API is on http://localhost:5050 and Swagger on http://localhost:5050/swagger.
3. **Frontend:** in `frontend/` run `npm install`, then `ng serve`, and open http://localhost:4200 (Angular 22 needs Node.js 22.22.3+ or 24.15+).

## Structure

| Where | What |
|---|---|
| `database.sql` | tables `location`, `category`, `item` with primary and foreign keys, and 15 example rows |
| `backend/FoodInventory.Model` | `Entities/` (one class per table), `Repositories/` (SQL through Npgsql, on the course's `BaseRepository`) |
| `backend/FoodInventory.API` | `Controllers/`: `/api/Item` and `/api/Category` (GET, GET `{id}`, POST, PUT, DELETE `{id}`), `/api/Location` (GET); `Program.cs` |
| `frontend/src/app` | `model/` (interfaces), `services/` (calls to the API), pages `item-list/`, `edit-item/` (add and edit), `category-list/` |
