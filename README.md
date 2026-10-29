# Food inventory

Track the food you have at home: register groceries when you buy them and delete them when they are used up.
No login: everyone who opens the app shares one inventory.

Course project for *Designing and Developing Digital Business Applications* (CBS): PostgreSQL, ASP.NET Core Web API (C#, .NET 8) and Angular 22.

## Run it

Needs PostgreSQL, the .NET 8 SDK and Node.js 22.22.3 or newer (or 24.15+), which Angular 22 requires.

1. **Database** (once; in pgAdmin you can run the two scripts in the Query Tool instead):
   ```bash
   createdb -U postgres food_inventory
   psql -U postgres -d food_inventory -f database/create_tables.sql
   psql -U postgres -d food_inventory -f database/seed_data.sql
   ```
2. **API**: check the connection string in `backend/appsettings.json`, then run `dotnet run` in `backend/`.
   It listens on http://localhost:5000, with Swagger at http://localhost:5000/swagger.
3. **App**: in `frontend/` run `npm install`, then `npx ng serve`, and open http://localhost:4200.

## Tests

- `dotnet test` in the repo root: the API against a brand-new PostgreSQL database per test, built from the scripts in `database/`.
  Set `TEST_DB_ADMIN` if PostgreSQL is not on localhost with user and password `postgres`.
- `npx ng test --watch=false` in `frontend/`: the form's validation rules and date helpers (Vitest, no browser needed).

## Where things are

| Folder | What is in it |
|---|---|
| `database/` | `create_tables.sql` (3 related tables, primary and foreign keys), `seed_data.sql` (15 example records) |
| `backend/Models/` | `Entities.cs` (one class per table), `Dtos.cs` (the JSON in and out), `Rules.cs` (validation rules and messages) |
| `backend/Data/` | `AppDbContext.cs` (Entity Framework Core on PostgreSQL) |
| `backend/Controllers/` | `ItemsController`, `CategoriesController` and `LocationsController` (full CRUD) |
| `backend.Tests/` | xUnit tests of the API |
| `frontend/` | the Angular project `FoodInventory.NG`, made with Angular CLI 22.2.0 like the course project (`ng new`) |
| `frontend/src/app/` | `app.*`: the frame (page, message bar, tab bar Add / Inventory / Ate it), the routes, the config; the pages `item-list/` (inventory), `item-form/` (add and edit), `eat-list/` (Ate it), `settings/`, `category-list/`, `location-list/`; the parts `top-bar/` and `icon/`; `api.ts` (the service for the API), `inventory.ts` (the shared data and message bar), `models.ts`, `rules.ts` |
| `prototype-frontend/` | Old design prototype (Node.js + SQLite), **for reference only**: not the real app, not part of the submission. The real frontend is `frontend/`. |

Code style: Prettier with `frontend/.prettierrc` (run `npx prettier --write src` in `frontend/`).

## API

- Items: `GET /items`, `GET /items/{id}`, `POST /items` (201), `PUT /items/{id}` (send the whole item), `DELETE /items/{id}` (204).
- Categories: `GET /categories`, `POST /categories` (201), `PUT /categories/{id}`, `DELETE /categories/{id}` (204).
- Locations: `GET /locations`, `POST /locations` (201), `PUT /locations/{id}`, `DELETE /locations/{id}` (204).
- Errors: 400 invalid data (one message per field) or malformed JSON, 404 unknown id, 409 duplicate name, or category or location in use, 500 server error.

## Demo script (at phone width)

1. Inventory: the example items grouped by category, expiring ones on top with a yellow warning sign. Search for "fridge".
2. Add: try an empty form first (messages appear under the fields), then save a valid one.
3. Tap the item to edit it, then delete it after the confirmation.
4. Ate it: tap "Ate it" on an item, then Undo in the message bar.
5. Settings (gear) → Categories: add one, try a duplicate name, rename it, try to delete Dairy (blocked, with the item count), delete the new one.
6. Settings → Storage locations: add "Cellar", rename it, try to delete Fridge (blocked, it holds items), delete Cellar.

## Submission zip

`git archive --format=zip -o food-inventory.zip HEAD` packs the code and SQL scripts only (no `node_modules`, `bin` or `obj`).
