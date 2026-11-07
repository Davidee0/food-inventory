# CLAUDE.md

Food inventory, CBS course project (Designing and Developing Digital Business Applications). PostgreSQL, ASP.NET Core Web API (C#, .NET 10), Angular 22 with Angular Material. No login: one shared inventory.

## How to work
Follow the professor's lecture slides (Lectures 4 to 8, course project CourseAdminSystem) as closely as possible, so the team can map every file to a slide. README.md has the map: keep it up to date, including "Where the app differs from the slides, on purpose".
Keep it simple: no code, libraries, files or patterns the lectures do not use unless a user story needs them (then list it under "What the app adds to the lectures" in README.md).
No hyphens or em dashes in prose written for the team (README, comments, PR texts).
BACKLOG.md has the user stories, acceptance criteria and Definition of Done: update a story there when its behaviour changes. CI (`.github/workflows/ci.yml`) must stay green.

## Database (`database.sql`)
`storage_location`, `category`, `food_item` (quantity > 0, optional best_before_date not before purchase_date, optional category_id, required storage_location_id), `food_log` (the history of US14: a copy of the name, quantity, log_date, wasted, optional category_id with `on delete set null`). The foreign keys refuse to delete a category or storage location that still has food. CI uses the seed ids (16 is the first new food item and history row, 7 the first new category): update them when the seed rows change.

## Backend (Lecture 4 and 6)
* .NET SDK 10 as Lecture 4 asks: `net10.0`, `FoodInventory.slnx`, packages Npgsql 10, Microsoft.Extensions.Configuration, Swashbuckle.AspNetCore and Swashbuckle.AspNetCore.SwaggerUI.
* `FoodInventory.Model`: `Entities/` (a class per table, constructor with the id, `[Required]`/`[Range]` only), `Repositories/` (`XRepository : BaseRepository`, SQL with `@parameters`, `using var dbConn`). `BaseRepository.cs` is the slide's file: do not change it. Npgsql 10 reads `date` as `DateOnly`: cast with `(DateOnly)data["column"]`.
* `FoodInventory.API`: `[Route("api/[controller]")]` controllers with explicit `if` statements as in the course. PUT gets the whole object. NotFound for unknown ids; 409 Conflict when a category or storage location still has food; 400 BadRequest when the best before date is before the purchase date.
* `Program.cs` as the template plus the professor's edits: `AddScoped<X, X>()`, Swagger, no HTTPS redirection, `app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin())`.
* Port 5050 in `Properties/launchSettings.json`, connection string `AppProgDb`, `<Nullable>disable</Nullable>`.

## Frontend (Lecture 5 to 8)
* Made with `ng new FoodInventory.NG` (Angular CLI 22.2.5, CSS, no SSR, zone.js) and `ng add @angular/material`; components with `ng generate component X --skip-tests`, services with `ng generate service services/X --injectable --skip-tests`.
* Style of the slides: constructor injection (`constructor(private x: XService)`), `@Input()`, `ngOnInit()` + `subscribe`, plain class fields (no signals).
* Angular 22 components are OnPush by default: after a `subscribe` stores data, call `this.cdr.markForCheck()` (Lecture 6, slide 33).
* `edit-food-item`: template driven form (`FormsModule`, `[(ngModel)]`, `#x="ngModel"`) as Lecture 7. `add-food-item`: Reactive Form with Angular Material as Lecture 8. Lists are tables as Lecture 5.
* Dates are `"YYYY-MM-DD"` strings; an emptied date field gives `''`, send `null`.

## Commands
`dotnet build backend/FoodInventory.slnx` · `dotnet run --project backend/FoodInventory.API` · in `frontend/`: `npm install`, `ng serve`, `ng test --watch=false`, `npx prettier --write src`.
