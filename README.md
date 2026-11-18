# Food inventory

A web app to keep track of the food at home: add what you buy, see what to eat first, and tap **Ate one** when you eat something. One shared list for the household, no login.

Households waste the most food: 60% of the 1.05 billion tonnes wasted in 2022 ([UNEP Food Waste Index Report 2024](https://www.unep.org/news-and-stories/press-release/world-squanders-over-1-billion-meals-day-un-report)). Design: [Figma](https://www.figma.com/design/NcVVu2BWhFgR8RkuFfXbg9).

Group project for the CBS course *Designing and Developing Digital Business Applications*. It uses PostgreSQL, an ASP.NET Core Web API (.NET 10) and Angular 22, and is built like the course project CourseAdminSystem.

<img src="docs/screenshots/01-food-list.png" width="250" alt="The food list with Expired and Eat soon"> <img src="docs/screenshots/03-add-validation.png" width="250" alt="The add form with its messages"> <img src="docs/screenshots/09-category-refused.png" width="250" alt="A category with food cannot be deleted">

## Features

- **Food:** add, edit and delete food (name, quantity, purchase date, best before date, category, storage location). The form, the API and the database all check the input.
- **The list:** the food that goes off first is at the top; "Expired" and "Eat soon" are marked with an icon and text.
- **Search and filters:** search by name; filter by category and by storage location.
- **Ate one:** lowers the quantity by one; the last one is deleted after a question.
- **Categories and storage locations:** add, rename and delete them. One that still has food cannot be deleted; the API answers 409 and the page says why.

The user stories and their acceptance criteria are in [docs/BACKLOG.md](docs/BACKLOG.md).

## Structure

```
Database/                     setup.sql (one command) and food_inventory.sql (3 tables, 21 example rows)
Backend/                      FoodInventory.slnx
  FoodInventory.API/          Controllers, Program.cs, appsettings.json (connection string AppProgDb)
  FoodInventory.Model/        Entities (one class per table) and Repositories (the SQL, on BaseRepository)
  FoodInventory.Tests/        xUnit + Moq tests of the controllers
Frontend/FoodInventory.NG/    the Angular app
  src/app/                    http-common.ts (the API address), model/, services/, components
```

Angular (port 4200) calls the Web API (port 5050) with JSON; the API runs SQL in PostgreSQL (port 5432).

## Run it

You need PostgreSQL (with pgAdmin), the .NET 10 SDK, Node.js 24 and the Angular CLI (`npm install -g @angular/cli`).

1. Database (asks for the password of the user `postgres`; safe to run again):
   ```shell
   psql -h localhost -U postgres -f Database/setup.sql
   ```
   Without `psql`: create the database `food_inventory` in pgAdmin and run `Database/food_inventory.sql` in its Query Tool.
2. Web API, on http://localhost:5050 (Swagger: http://localhost:5050/swagger):
   ```shell
   cd Backend
   dotnet run --project FoodInventory.API
   ```
   If your PostgreSQL password is not `postgres`, change it in `Backend/FoodInventory.API/appsettings.json`.
3. App, on http://localhost:4200 (in a second terminal):
   ```shell
   cd Frontend/FoodInventory.NG
   npm install
   ng serve
   ```

## Tests

```shell
cd Backend
dotnet test
```

```shell
cd Frontend/FoodInventory.NG
ng test --watch=false
```

There are 27 xUnit tests of the controllers, with a mocked repository, and 23 Karma + Jasmine tests of the components and services. GitHub Actions (`.github/workflows/tests.yml`) runs them on every pull request, together with the database script and checks of the API's answers.

## API

| Resource | Endpoints |
|---|---|
| `/api/FoodItem` | `GET` all, `GET /{id}`, `POST`, `PUT` (the whole item, id included), `DELETE /{id}` |
| `/api/Category` | the same |
| `/api/StorageLocation` | the same |

The data is JSON; dates are `"YYYY-MM-DD"`. The answers:

| Status | When |
|---|---|
| 200 | ok |
| 204 | deleted |
| 400 | wrong input, with a message |
| 404 | unknown id |
| 409 | a category or storage location still has food |

## Database

Three tables: `storage_location`, `category` and `food_item`.

- Every food item has one storage location and at most one category (two foreign keys).
- `check` rules refuse an empty name, a quantity below 1 and a best before date before the purchase date.

## Credits

- The course project CourseAdminSystem (CBS).
- README idea: Giacomo Sanna's [crud-app](https://github.com/Giacomo-Sanna/crud-app).
