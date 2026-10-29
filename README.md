# Food inventory

Track the food you have at home: add groceries when you buy them, delete them when they are used up. No login: one shared inventory.
CBS course project (Designing and Developing Digital Business Applications): PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22.

## Run

1. **Database:** in pgAdmin, create the database `food_inventory`, open the Query Tool on it and run `database.sql`.
2. **Backend:** check the connection string `AppProgDb` in `backend/FoodInventory.API/appsettings.json`, then run `dotnet run --project backend/FoodInventory.API`.
   The API is on http://localhost:5050 and Swagger on http://localhost:5050/swagger.
3. **Frontend:** in `frontend/` run `npm install`, then `ng serve`, and open http://localhost:4200 (Angular 22 needs Node.js 22.22.3+ or 24.15+).

Tests: `npx ng test --watch=false` in `frontend/` (the form's rules and dates, the tab bar).

## Structure

| Where | What |
|---|---|
| `database.sql` | tables `storage_location`, `category`, `food_item` with primary and foreign keys, and 15 example rows |
| `backend/FoodInventory.Model` | `Entities/` (one class per table, with the validation rules), `Repositories/` (SQL through Npgsql, on the course's `BaseRepository`) |
| `backend/FoodInventory.API` | `Controllers/`: `/api/FoodItem`, `/api/Category` and `/api/StorageLocation` (GET, GET `{id}`, POST, PUT, DELETE `{id}`); `Program.cs` |
| `frontend/src/app` | design U8: pages `item-list/` (inventory), `item-form/` (add and edit), `eat-list/` (Ate it), `settings/`, `category-list/`, `location-list/`; parts `top-bar/`, `icon/`; `model/` (interfaces), `services/` (calls to the API), `inventory.ts` (shared data, message bar), `rules.ts` (form rules, dates) |
| `prototype-frontend/` | Kilian's Node prototype the U8 design comes from (reference only) |

## Demo script (at phone width)

1. Inventory: the example items grouped by category, expiring ones on top with a yellow warning sign. Filter by Dairy, add Freezer (nothing matches), then Clear filters.
2. Add: try an empty form first (messages appear under the fields), then save a valid one.
3. Tap the item to edit it (change the quantity), then delete it after the confirmation.
4. Ate it: tap "Ate it" on Pasta (3 → 2: one less each tap, the last one takes it off the list), then Undo in the message bar. Scroll: the top bar and the tab bar stay.
5. Gear → Settings → Categories: add one, rename it, try to delete Drinks (refused: it still has food), delete the new one.
6. Settings → Storage locations: add "Cellar", rename it, try to delete Fridge (refused: it still has food), delete Cellar.

## Submission zip

`git archive --format=zip -o food-inventory.zip HEAD` packs the code and the SQL script only (no `node_modules`, `bin` or `obj`).
