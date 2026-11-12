# Food inventory

Track the food you have at home: add groceries when you buy them, tap "Ate it" when you eat them. No login: one shared inventory.
CBS course project (Designing and Developing Digital Business Applications): PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22 with Angular Material.
The code follows the lecture code (CourseAdminSystem, Lectures 4 to 10).

## Run

1. **Database:** in pgAdmin, create the database `food_inventory`, open the Query Tool on it and run `database.sql`.
2. **Backend:** check the connection string `AppProgDb` in `backend/FoodInventory.API/appsettings.json`, then run `dotnet run --project backend/FoodInventory.API`.
   The API is on http://localhost:5050 and Swagger on http://localhost:5050/swagger.
3. **Frontend:** in `frontend/` run `npm install`, then `ng serve`, and open http://localhost:4200 (Angular 22 needs Node.js 22.22.3+ or 24.15+).

Tests: `dotnet test backend/FoodInventory.sln` (backend, Lecture 9) and `ng test` in `frontend/`.

## Structure

| Where | What | Lecture |
|---|---|---|
| `database.sql` | tables `storage_location`, `category`, `food_item` with primary and foreign keys, and 15 example rows | 3 |
| `backend/FoodInventory.Model` | `Entities/` (one class per table), `Repositories/` (SQL through Npgsql, on the course's `BaseRepository`) | 4 |
| `backend/FoodInventory.API` | `Controllers/`: `/api/FoodItem`, `/api/Category`, `/api/StorageLocation` (GET, GET `{id}`, POST, PUT, DELETE `{id}`) | 4 |
| `backend/FoodInventory.Tests` | xUnit + Moq tests for `FoodItemController` | 9 |
| `frontend/src/app/model`, `services` | interfaces and one service per controller (HttpClient, Observables); `NotificationService` (snackbar) | 6, 10 |
| `frontend/src/app` components | `item-list` (inventory with search), `item-form` (add and edit, reactive form with validation), `eat-list` (Ate it), `settings` (categories and storage locations, two-way binding) | 6 to 10 |

How it works:
- The inventory is sorted by best before date (soonest first, from the API). Food that expires within 3 days or has expired gets a warning sign and text.
- "Ate it": each tap eats one (5 oranges become 4); the last one deletes the item. The snackbar has Undo.
- A category or storage location that still has food in it cannot be deleted: the foreign key refuses it and the API answers 409 with a message.
- Validation in layers (Lecture 7): the form checks the fields, the database checks the rest (not null, quantity > 0, best before not before purchase date, no empty names).

## Demo script (at phone width)

1. Inventory: the example items, soonest best before date first; Milk has a warning sign. Search for "pantry".
2. Add: the Save button stays grey until name and storage location are filled in. Try a best before date before the purchase date (message), then save.
3. Edit an item (change the quantity), then delete it after the confirmation.
4. Ate it: tap "Ate it" on Pasta (3 → 2), then Undo in the snackbar.
5. Gear → Settings: add a category, rename it, try to delete Drinks (refused: it still has food), delete the new one. The same for storage locations.

## Submission zip

`git archive --format=zip -o food-inventory.zip HEAD` packs the code and the SQL script only (no `node_modules`, `bin` or `obj`).
