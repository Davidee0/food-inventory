# Food inventory

Track the food you have at home: register groceries when you buy them and delete them when they are used up.
No login: everyone who opens the app shares one inventory.

Course project for *Designing and Developing Digital Business Applications* (CBS): PostgreSQL, ASP.NET Core Web API (C#, .NET 10) and Angular 22,
set up like the course project `CourseAdminSystem` (lectures 4 and 5). Product Goal, user stories with acceptance criteria and the
Definition of Done: [BACKLOG.md](BACKLOG.md).

## Run it

Needs PostgreSQL with pgAdmin, the .NET 10 SDK and Node.js 24 LTS (Angular 22 also runs on Node 22.22.3+).

1. **Database** (once): in pgAdmin create the database `food_inventory`, then run `Database/create_tables.sql` and then
   `Database/seed_data.sql` in the Query Tool. Or in a terminal:
   ```bash
   createdb -U postgres food_inventory
   psql -U postgres -d food_inventory -f Database/create_tables.sql -f Database/seed_data.sql
   ```
2. **API**: check `AppProgDb` in `Backend/FoodInventory.API/appsettings.json`, then in `Backend/` run `dotnet run --project FoodInventory.API`.
   It listens on http://localhost:5000, with Swagger at http://localhost:5000/swagger.
3. **App**: in `Frontend/FoodInventory.NG/` run `npm install`, then `npx ng serve`, and open http://localhost:4200.

**One database for the whole team** (optional, exercise E02.1): create a free PostgreSQL database on Supabase, run the two scripts
in its SQL Editor, and give the API its .NET connection string in an environment variable, so the password never goes to GitHub:
`ConnectionStrings__AppProgDb="<connection string>" dotnet run --project FoodInventory.API` (Windows PowerShell:
`$env:ConnectionStrings__AppProgDb="<connection string>"`, then `dotnet run --project FoodInventory.API`).
Everyone then sees the same data. The tests still use a local PostgreSQL.

## Tests

- `dotnet test` in `Backend/`: the API against a brand-new PostgreSQL database per test, built from the scripts in `Database/`.
  Set `TEST_DB_ADMIN` if PostgreSQL is not on localhost with user and password `postgres`.
- `npx ng test --watch=false` in `Frontend/FoodInventory.NG/`: the form rules and date helpers, and every component (Vitest, no browser needed).

## Where things are

| Folder | What is in it |
|---|---|
| `Database/` | `create_tables.sql` (3 related tables, primary and foreign keys), `seed_data.sql` (15 example records) |
| `Backend/FoodInventory.API/` | `Program.cs`, `Controllers/` (`LocationController` read only, `ItemController` and `CategoryController` with full CRUD), `Rules.cs` (validation rules and messages) |
| `Backend/FoodInventory.Model/` | `Entities/` (one class per table) and `Repositories/` (`BaseRepository` from the course, one repository per table: SQL with Npgsql) |
| `Backend/FoodInventory.Tests/` | xUnit tests of the API |
| `Frontend/FoodInventory.NG/` | the Angular project, made with `ng new` (Angular CLI 22.2.0) like the course project |
| `Frontend/FoodInventory.NG/src/app/` | `app.*` (title, links, `<router-outlet />`, routes `/items` and `/categories`); `item-list/` + `item-card/` and `category-list/` + `category-card/` (a list and its cards: `@Input` down, `@Output` up); `item-form/` (the Add/Edit dialog); `model/` (the interfaces); `api.ts` (the service for the API); `rules.ts` |

Code style: Prettier with `.prettierrc` (run `npx prettier --write src` in `Frontend/FoodInventory.NG/`).

## API

- Items: `GET /api/Item`, `GET /api/Item/{id}`, `POST /api/Item` (201), `PUT /api/Item/{id}` (send the whole item), `DELETE /api/Item/{id}` (204).
- Categories: `GET /api/Category`, `POST /api/Category` (201), `PUT /api/Category/{id}`, `DELETE /api/Category/{id}` (204).
- Locations: `GET /api/Location` (Fridge, Freezer, Pantry).
- JSON is camelCase, the .NET default: `{"name":"Milk","locationId":1,"categoryId":1,"purchaseDate":"2026-11-01","bestBefore":"2026-11-06"}`.
- Errors: 400 invalid data (one message per field: `{"errors":{"name":"Enter a name."}}`) or malformed JSON, 404 unknown id,
  409 duplicate category name or category in use, 500 server error.
- Try it in Swagger (http://localhost:5000/swagger) or in Postman like exercise E04.1: `GET http://localhost:5000/api/Item`.

## Design

Figma: https://www.figma.com/design/NcVVu2BWhFgR8RkuFfXbg9 (the steps from lecture 2): **1 Wireframes** of the three phone screens,
then **2 UI design** with the colours of `styles.css` as variables, the components (Button, Header, Field, Item card, Category card)
and the screens as a clickable prototype (press Play). Each screen links to its code here; change design and code together.

## Demo script (at phone width)

1. See the 6 example items, soonest best before date first.
2. Add an item: try an empty form first (messages appear under the fields), then save a valid one.
3. Edit it, then delete it after the confirmation.
4. Open Categories: add one, try a duplicate name, rename it, try to delete Dairy (blocked, with the item count), delete the new one.

## Submission zip

`git archive --format=zip -o food-inventory.zip HEAD` packs the code and SQL scripts only (no `node_modules`, `bin` or `obj`).
