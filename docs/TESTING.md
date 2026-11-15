# Testing

What we test, how, and what we found (Lecture 9). Use it for the testing section of the report: fill in the Result column with your own run and add screenshots from Swagger and the browser.

## Before you run it

* **.NET:** the project targets .NET 8, and .NET 8 reached end of support on 10 November 2026. Lecture 4 installs the .NET 10 SDK, and with only .NET 10 the API stops at start with "You must install or update .NET to run this application ... version 8.0.0". Two ways out, no code change needed:
  * run with `DOTNET_ROLL_FORWARD=Major`, so the .NET 8 app runs on .NET 10 (macOS and Linux: `DOTNET_ROLL_FORWARD=Major dotnet run --project backend/FoodInventory.API`; Windows PowerShell: `$env:DOTNET_ROLL_FORWARD="Major"` first). The checks on GitHub ran the tests and the API this way;
  * or install the .NET 8 SDK next to .NET 10.
  `dotnet --list-runtimes` shows what you have.
* **Password:** `appsettings.json` uses the user `postgres` with password `postgres`. If yours is different, do not commit your real password; set it for your terminal only: `ConnectionStrings__AppProgDb="Host=localhost;Port=5432;Database=food_inventory;Username=postgres;Password=YOUR_PASSWORD"` (PowerShell: `$env:ConnectionStrings__AppProgDb="..."`), then `dotnet run`.
* **Database:** `database.sql` creates the tables, so run it on an empty database. To start again: delete the database `food_inventory` in pgAdmin, create it again and run the script.
* **Icons:** the Material icons load from Google Fonts, so the browser needs internet.

## Automated tests

| Command | What it tests | Result on the pull request |
|---|---|---|
| `dotnet test backend/FoodInventory.sln` | 6 xUnit tests with Moq for `FoodItemController` (Lecture 9): GET found and not found, GET all, POST, PUT for an unknown id, DELETE | 6 passed |
| `ng test --watch=false` in `frontend/` | 2 Vitest tests: the app starts and the toolbar shows "U8" | 2 passed |
| `ng build` in `frontend/` | the production build compiles | passes |

GitHub runs all of them on every pull request (`.github/workflows/tests.yml`), and also loads `database.sql` into PostgreSQL 16, starts the API and checks its answers (the API tests below marked CI).

## Manual tests

Start the database, the API (http://localhost:5050) and the frontend (http://localhost:4200). Tick a test when the result matches.

### Database (pgAdmin Query Tool on `food_inventory`)

| ID | Do | Expected | Result |
|---|---|---|---|
| D1 | Run `database.sql` on an empty database | No errors; 6 food items, 6 categories, 3 storage locations | |
| D2 | `insert into food_item (name, quantity, purchase_date, storage_location_id) values ('Test', 0, current_date, 1);` | Error: check constraint on quantity | |
| D3 | The same with `best_before_date` the day before `purchase_date` | Error: check constraint on the dates | |
| D4 | The same with an empty name `''` | Error: check constraint on the name | |
| D5 | The same with `category_id` 999 | Error: foreign key | |
| D6 | `delete from category where name = 'Dairy';` | Error: Milk still uses it (foreign key) | |

### API (Swagger at http://localhost:5050/swagger)

| ID | Do | Expected | Result |
|---|---|---|---|
| A1 | GET `/api/FoodItem` | 200, 6 items: Chicken breast (expired) first, Pasta (no date) last | CI |
| A2 | GET `/api/FoodItem/1`, then `/api/FoodItem/999` | 200 with Milk, then 404 | CI |
| A3 | POST `/api/FoodItem` with a valid item (`id` 0, `bestBeforeDate` null) | 200; GET shows it | CI |
| A4 | PUT `/api/FoodItem` with Milk and quantity 3 | 200; GET shows 3 | CI |
| A5 | PUT or DELETE with an id that does not exist | 404 with "Food item with id 999 not found" | CI |
| A6 | DELETE `/api/FoodItem/{id}` for the new item, then again | 204, then 404 | CI |
| A7 | POST `/api/FoodItem` with quantity 0 or an empty name | Refused (an error status, not 200): the database blocks it. Finding: the API answers 500, not 400, because validation sits in the form and the database | |
| A8 | DELETE `/api/Category/1` (Dairy) | 409 "Dairy still has food in it, so it cannot be deleted." | CI |
| A9 | POST, PUT and DELETE a new category | 200, 200, 204 | CI |
| A10 | DELETE `/api/StorageLocation/1` (Fridge) | 409 "Fridge still has food in it, so it cannot be deleted." | CI |

### Frontend (http://localhost:4200, also at 360 px wide with the browser's device toolbar)

| ID | Do | Expected | Result |
|---|---|---|---|
| F1 | Open the app | Inventory with 6 items, soonest best before date first; Chicken breast "Expired", Milk "Expires soon", both with a warning icon | |
| F2 | Search "pantry", then "dairy", then "xyz" | Only pantry items; only Milk; "No food found" | |
| F3 | Add: click in the name, leave it empty and go to the next field | "Item name is required" under the field, Save disabled | |
| F4 | Add: quantity 0, then leave the field | "Quantity must be at least 1", Save disabled | |
| F5 | Add: best before date before the purchase date, Save | "Best before date cannot be before the purchase date"; nothing saved | |
| F6 | Add a valid item, Save | "Bread saved", the inventory opens and shows it | |
| F7 | Edit an item: change the quantity, clear the best before date, Save | The card shows the new quantity and no best before date | |
| F8 | Delete an item, Cancel; then Delete, OK | It stays; then it disappears with "... deleted" | |
| F9 | Ate it: tap "Ate it" on Pasta, then Undo | 3 left becomes 2, Undo brings back 3; on the last one the item disappears | |
| F10 | Gear: add a category, rename it, delete Dairy, delete the new one | Added and renamed; Dairy refused with the 409 message; the new one deleted. The same for storage locations | |
| F11 | Stop the API, reload the inventory | The message "Could not load the food items" (the list itself says "No food found") | |
| F12 | Every page at 360 px | No sideways scrolling; the tab bar Add, Inventory, Ate it at the bottom | |

## Known limitations (for the reflection in the report)

* No login: one shared inventory for everybody (by design).
* Validation sits in the form and the database (Lecture 7 layers). The API has no checks of its own, so a wrong POST from Swagger gets 500 instead of 400 with a message (A7).
* Category and storage location names can repeat ("Dairy" twice is accepted).
* Adding or renaming a category or storage location that the database refuses (for example a name over 30 characters) shows no message.
* When the API is down, the inventory shows the error message but also "No food found", and there is no Try again button (reload the page).
* .NET 8 is out of support (see "Before you run it").
