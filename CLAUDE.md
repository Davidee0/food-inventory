# CLAUDE.md

Food inventory, CBS course project (Designing and Developing Digital Business Applications). PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22. No login; one shared inventory.
Built: US1-US8. Optional US9-US13 (quantity, filters, highlights, sort toggle, locations CRUD) are deliberately not built.

## How to work
Follow the professor's notes and course project (CourseAdminSystem). Less is more: no code, libraries or files the app does not need.
Course requirements: 3 related tables with PK/FK and 15 example rows; CRUD for items and categories; at least 4 Angular components; a service for the API; a form with two-way binding and validation; Swagger.

## Backend (as in the course)
- `FoodInventory.Model`: `Entities/` (a class per table, constructor with the id), `Repositories/` (`XRepository : BaseRepository` with GetXById, GetXs, InsertX, UpdateX, DeleteX; SQL with `@parameters`). `BaseRepository` is the course's file.
- `FoodInventory.API`: `[Route("api/[controller]")]` controllers get their repository in the constructor (`AddScoped` in `Program.cs`). PUT gets the whole object, id included; NotFound when the id does not exist. Port 5050, connection string `AppProgDb`, CORS for http://localhost:4200.
- JSON is camelCase (ASP.NET default). Dates: `date` columns, `DateOnly`, "YYYY-MM-DD".
- `[Required]` on `Name`: ASP.NET's implicit required check lets "" and spaces through in JSON.
- Deleting a category keeps its items, without a category (`on delete set null`).

## Frontend (as in the course)
`ng new` project FoodInventory.NG (Angular CLI 22.2.0, zoneless, Vitest). `model/` interfaces; `services/` (HttpClient, Observables); routed pages `items` (ItemList), `add-item` and `edit-item/:id` (EditItem: `[(ngModel)]` + `required`; the id arrives as `@Input()` through `withComponentInputBinding`), `categories` (CategoryList). Nav: a `<ul>` of `routerLink`s in `app.html`.
Zoneless: after setting a field in `subscribe`, call `this.cdr.markForCheck()`, or the page does not update.
Mobile: 16 px text, 44 px buttons and fields, no sideways scrolling at 360 px. All styles are in `styles.css`.

## Commands
`dotnet build backend/FoodInventory.sln` · `dotnet run --project backend/FoodInventory.API` · in `frontend/` (Node 22.22.3+): `npx ng serve`, `npx ng build`, `npx ng test --watch=false`, `npx prettier --write src`.
