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
| `backend/Controllers/` | `LocationsController` (read only), `ItemsController` and `CategoriesController` (full CRUD) |
| `backend.Tests/` | xUnit tests of the API |
| `frontend/src/app/` | components `app` (the page), `item-list`, `item-form`, `categories` (e.g. `item-form.ts` + `item-form.html`); `core/` has `api.ts` (the API service), `models.ts` and `rules.ts` |

Code style: Prettier with `frontend/.prettierrc` (run `npx prettier --write src` in `frontend/`).

## API

- Items: `GET /items`, `GET /items/{id}`, `POST /items` (201), `PUT /items/{id}` (send the whole item), `DELETE /items/{id}` (204).
- Categories: `GET /categories`, `POST /categories` (201), `PUT /categories/{id}`, `DELETE /categories/{id}` (204).
- Locations: `GET /locations` (Fridge, Freezer, Pantry).
- Errors: 400 invalid data (one message per field) or malformed JSON, 404 unknown id, 409 duplicate category name or category in use, 500 server error.

## Demo script (at phone width)

1. See the 6 example items, soonest best before date first.
2. Add an item: try an empty form first (messages appear under the fields), then save a valid one.
3. Edit it, then delete it after the confirmation.
4. Open Categories: add one, try a duplicate name, rename it, try to delete Dairy (blocked, with the item count), delete the new one.

## Submission zip

`git archive --format=zip -o food-inventory.zip HEAD` packs the code and SQL scripts only (no `node_modules`, `bin` or `obj`).
