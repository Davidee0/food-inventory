# CLAUDE.md

Food inventory, CBS course project (Designing and Developing Digital Business Applications). PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22 + Angular Material. No login, no users, no encryption; one shared inventory.

## How to work
- Write the code the way the lecture slides do (CourseAdminSystem, Lectures 4 to 10). Less is more: no code, libraries or files the app does not need, and nothing twice.
- Project guide: several related tables with PK/FK and at least 10 records; CRUD with GET/POST/PUT/DELETE for at least two entities; at least 4 Angular components; services for the API; a form with two-way binding and basic validation.
- README.md describes the app, the structure and the demo script: keep it up to date.

## Backend (Lectures 4 and 9)
- `FoodInventory.Model`: `Entities/` (plain classes, constructor with the id), `Repositories/` (`XRepository : BaseRepository`, SQL with `@parameters`). `BaseRepository` is the course's file. `Nullable` is disabled, as in the slides.
- `FoodInventory.API`: `[Route("api/[controller]")]` controllers get their repository in the constructor (`AddScoped` in `Program.cs`). PUT gets the whole object; NotFound when the id does not exist; 409 with a message when a category or storage location still has food. Port 5050, connection string `AppProgDb`, CORS as in Lecture 6.
- `FoodInventory.Tests`: xUnit + Moq, like Lecture 9; the mocked repository methods are `virtual`.
- Dates: `date` columns, `DateOnly`, JSON "YYYY-MM-DD".

## Frontend (Lectures 6 to 10)
- Components: App (mat-toolbar with the gear, bottom tab bar Add / Inventory / Ate it), ItemList (`/items`, search), ItemForm (`/add`, `/edit/:id`, reactive form with Validators and mat-error), EatList (`/eat`), Settings (`/settings`, `[(ngModel)]`).
- Each component calls its services in `ngOnInit` with `.subscribe(...)`. Angular 22 components are OnPush by default, so call `this.cdr.markForCheck()` after data arrives (Lecture 10).
- `NotificationService` (MatSnackBar) for messages, Undo for "Ate it". Delete asks with `confirm()`.
- `model/food-item.ts` also has `today()` (local date) and `expiryText()` ("soon" = within 3 days).
- Material Icons come from the Google Fonts link in `index.html` (Lecture 10). Styles: `src/styles.css` only (U8 colours: paper #f5f5f1, band #e8e8e3, ink #242424, warning #f5c400; one 430px column).

## Commands
`dotnet build backend/FoodInventory.sln` · `dotnet test backend/FoodInventory.sln` · `dotnet run --project backend/FoodInventory.API` · in `frontend/`: `ng serve`, `ng build`, `ng test --watch=false`.
