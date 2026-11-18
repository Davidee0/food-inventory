# Testing

What we test, how, and what we found (Lecture 9). Use it for the testing section of the report.

## How to run the tests

Backend (no database needed, the repositories are mocked):

```shell
cd Backend
dotnet test
```

Frontend (Karma opens Chrome; on a machine without a screen add `--browsers=ChromeHeadless`):

```shell
cd Frontend/FoodInventory.NG
npm install
ng test --watch=false
```

The expiry warning depends on "today". In UTC a wrong "today" (from `toISOString()`) would not show, so also run the frontend tests in a time zone far from UTC (macOS and Linux): `TZ=Pacific/Auckland ng test --watch=false`.

Before the manual tests: the database from `Database/setup.sql` (on a fresh database, so the example rows and their dates are as below), the API (`dotnet run --project FoodInventory.API` in `Backend/`, http://localhost:5050) and the frontend (`ng serve`, http://localhost:4200). If your PostgreSQL password is not `postgres`, do not commit your real one; set it for your terminal only: `ConnectionStrings__AppProgDb="Host=localhost:5432;Username=postgres;Password=YOUR_PASSWORD;Database=food_inventory"` (PowerShell: `$env:ConnectionStrings__AppProgDb="..."`), then `dotnet run`. The Material icons and the font load from Google Fonts, so the browser needs internet.

## Automated tests

| Command | What it tests | Result (18 November 2026) |
|---|---|---|
| `dotnet test` in `Backend/` | 24 xUnit tests with Moq (Lecture 9), 8 per controller: GET found (200) and not found (404), GET all (200), POST without a body (400), POST (200), PUT for an unknown id (404), DELETE (204); plus the date rule (400) for `FoodItemController` and the 409 when a category or storage location still has food | 24 passed |
| `ng test --watch=false --browsers=ChromeHeadless` in `Frontend/FoodInventory.NG/` | 18 Karma and Jasmine tests: one spec per component and service as `ng generate` makes them, fixed as in Lecture 9 (`provideRouter([])`, `provideHttpClient()`, `provideHttpClientTesting()`, a mock food item for `@Input()`, `HttpTestingController` for the edit form); the toolbar title; the expiry warning (none without a date, "Expired" yesterday, "Eat soon" today and in 3 days, none in 4 days); the edit form shows the food item from the mocked API; `deleteFoodItem` sends DELETE to `/api/fooditem/7` | 18 passed (also with `TZ=Pacific/Auckland`) |
| `ng build` | the production build compiles | passes |
| `dotnet build` | the backend compiles | 0 warnings, 0 errors |

GitHub runs all of them on every pull request and every push to `main` (`.github/workflows/tests.yml`), and also loads `Database/setup.sql` twice into PostgreSQL 16, starts the API and checks its answers with `curl` (the API tests below marked CI).

## Manual tests

Result column: our own run on 18 November 2026 (Chromium at 360 x 740 for the frontend).

### Database (pgAdmin Query Tool or `psql` on `food_inventory`)

| ID | Test | Expected | Result |
|---|---|---|---|
| D1 | Drop the database, run `psql -h localhost -U postgres -f Database/setup.sql`, then run it again | First run: database, 3 tables, 3 + 6 + 12 rows. Second run: no error, nothing added (only NOTICE "already exists, skipping") | Pass |
| D2 | `insert into food_item (name, quantity, purchase_date, storage_location_id) values ('Test', 0, current_date, 1);` | Error: check constraint on quantity | Pass (`food_item_quantity_check`) |
| D3 | The same with quantity 1 and `best_before_date` the day before `purchase_date` | Error: check constraint on the dates | Pass (`food_item_check`) |
| D4 | The same with an empty name `''` | Error: check constraint on the name | Pass (`food_item_name_check`) |
| D5 | The same with `category_id` 999 | Error: foreign key | Pass (`food_item_category_id_fkey`) |
| D6 | `delete from category where name = 'Dairy';` and `delete from storage_location where name = 'Fridge';` | Error: still referenced from `food_item` | Pass |

### API (Swagger at http://localhost:5050/swagger, or `curl`)

| ID | Test | Expected | Result |
|---|---|---|---|
| A1 | GET `/api/FoodItem` | 200, 12 items: Chicken breast (expired) first, Pasta and Rice (no date) last | Pass (CI) |
| A2 | GET `/api/FoodItem/1`, then `/api/FoodItem/999` | 200, then 404 | Pass (CI) |
| A3 | POST `/api/FoodItem` with a valid item (`id` 0, `bestBeforeDate` null) | 200; GET shows it | Pass (CI) |
| A4 | POST with an empty name, quantity 0, storage location 0, no purchase date | 400 with "Name is required", "Quantity must be at least 1", "Storage location is required", "Purchase date is required" | Pass (CI for the name) |
| A5 | POST or PUT with the best before date before the purchase date | 400 "Best before date cannot be before the purchase date" | Pass (CI for POST) |
| A6 | POST with storage location 99 | 400 "Category or storage location does not exist" | Pass |
| A7 | PUT `/api/FoodItem` with Milk and quantity 3 | 200; GET shows 3 | Pass (CI) |
| A8 | PUT or DELETE with an id that does not exist | 404 "Food item with id 999 not found" | Pass (CI for PUT) |
| A9 | DELETE `/api/FoodItem/13` (the new item), then again | 204, then 404 | Pass (CI) |
| A10 | DELETE `/api/Category/1` (Dairy) | 409 "Dairy still has food in it, so it cannot be deleted." | Pass (CI) |
| A11 | POST, PUT and DELETE a new category; then GET it | 200, 200, 204, then 404 | Pass (CI) |
| A12 | The same for a new storage location; PUT and DELETE with id 999 | 200, 200, 204; 404 "Storage location with id 999 not found" | Pass |
| A13 | DELETE `/api/StorageLocation/1` (Fridge) | 409 "Fridge still has food in it, so it cannot be deleted." | Pass (CI) |
| A14 | POST `/api/Category` with an empty name | 400 "Name is required" | Pass |
| A15 | `/swagger/index.html` and `/swagger/v1/swagger.json` | 200 | Pass (CI for the JSON) |
| A16 | A request with `Origin: http://localhost:4200`, and one with another origin | `Access-Control-Allow-Origin: http://localhost:4200`; no such header for the other origin | Pass (CI for 4200) |

### Frontend (http://localhost:4200, at 360 px wide with the browser's device toolbar)

| ID | Test | Expected | Result |
|---|---|---|---|
| F1 | Open the app | `/food-items` with 12 cards, soonest best before date first; Chicken breast "Expired", Milk and Yogurt "Eat soon", each with a warning icon; Pasta and Carrots not marked; "Loading..." while the API answers | Pass |
| F2 | Filter Dairy, then Dairy + Fridge, then Dairy + Freezer, then Clear filters | 3 cards with "Showing 3 of 12 items"; 3; "No food matches these filters."; 12 again | Pass |
| F3 | Add food: touch the fields and leave them wrong (empty name, quantity 0, no storage location, best before 2020-01-01) | "Name is required", "Quantity must be a whole number, at least 1", "Storage location is required", "Best before date cannot be before the purchase date"; Add disabled | Pass |
| F4 | Add food: a name of only spaces | "Name is required", Add disabled | Pass |
| F5 | Add Bread, 3, Pantry, Other, today, no best before date | Add enabled; snackbar "Bread added"; the list shows Bread with "Other · Pantry" | Pass |
| F6 | Edit Bread: the form; then empty name, quantity 0, best before 2020-01-01 | Pre-filled; the messages and "Error in data" instead of Update | Pass |
| F7 | Edit: Rye bread, 2, Freezer, best before today, Update | Snackbar "Rye bread saved", back on `/food-items`, the card shows quantity 2, Freezer, "Eat soon" | Pass |
| F8 | Ate one on Rye bread (2), then again on the last one | 2 becomes 1 with snackbar "Ate one Rye bread"; then the question "Delete Rye bread?" and it is gone | Pass |
| F9 | Delete Rice: OK; Delete Pasta: Cancel | "Delete Rice?", Rice gone, snackbar "Rice deleted"; Pasta stays | Pass |
| F10 | Menu, Categories: add Snacks, rename to Sweets (Save), reload; delete Dairy; delete Sweets | Added; "Sweets saved" and still there after reload; red snackbar "Dairy still has food in it, so it cannot be deleted."; Sweets deleted | Pass |
| F11 | Menu, Storage locations: add Cellar, rename to Balcony; delete Fridge; delete Balcony | "Cellar added", "Balcony saved"; red snackbar "Fridge still has food in it, so it cannot be deleted."; "Balcony deleted" | Pass |
| F12 | Every page at 360 px | No sideways scrolling (`scrollWidth` 360); buttons, links and fields at least 44 px high, text at least 16 px (also in the menu and the snackbars) | Pass |
| F13 | No food in the database (API answers `[]`) | "You have no food yet. Add your first item." | Pass |
| F14 | Stop the API, reload the list | "Could not load your food. Check that the API is running." | Pass |
| F15 | The browser console during F1 to F13 | No errors, apart from the browser's own "Failed to load resource: 409 (Conflict)" line for the two refused deletes | Pass |
| F16 | Stop the API, then Delete a category | Red snackbar "Failed to delete the category" (the 409 text only comes from the API) | Pass |
| F17 | Open http://localhost:4200/nothing-here | The list opens (`/food-items`), no console error | Pass |

## Known limitations (for the reflection in the report)

- No login: one shared inventory for everybody (by design, see the roadmap).
- Category and storage location names can repeat ("Dairy" twice is accepted).
- The snackbars appear at the top (as in Lecture 10) and cover the toolbar for 3 seconds (5 for errors) on a phone; "Close" hides them earlier.
- The backend tests mock the repositories, so the SQL itself is tested by CI's API calls and by the manual tests above, not by `dotnet test`.
- `npm audit` reports high-severity warnings in development tools only (picomatch inside the Angular CLI and Karma); `npm audit --omit=dev` finds none in what the browser loads.
- The `@angular-devkit/build-angular:karma` builder from Lecture 9's helper slide prints a deprecation note in Angular 22; it still works.
