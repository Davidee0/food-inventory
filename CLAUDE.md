# CLAUDE.md

Food inventory, CBS course project (Designing and Developing Digital Business Applications). PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22. No login; one shared inventory.

## How to work
Follow the project guide, the team roadmap and the professor's notes (course project CourseAdminSystem). Less is more: no code, libraries or files the app does not need.

## Backend (as in the course)
- `FoodInventory.Model`: `Entities/` (a class per table, constructor with the id), `Repositories/` (`XRepository : BaseRepository`; SQL with `@parameters`). `BaseRepository` is the course's file.
- `FoodInventory.API`: `[Route("api/[controller]")]` controllers get their repository in the constructor (`AddScoped` in `Program.cs`). Port 5050, connection string `AppProgDb`, CORS for http://localhost:4200.
- JSON is camelCase (ASP.NET default). Dates: `date` columns, `DateOnly`, "YYYY-MM-DD".

## Frontend: design "U8" (Kilian's prototype)
`ng new` project FoodInventory.NG (Angular CLI 22.2.0, zoneless, Vitest, Prettier). Bottom tab bar Add / Inventory / Ate it, message bar, `TopBar`, `Icon`.

## Commands
`dotnet build backend/FoodInventory.sln` · `dotnet run --project backend/FoodInventory.API` · in `frontend/` (Node 22.22.3+): `npx ng serve`, `npx ng build`, `npx ng test --watch=false`, `npx prettier --write src`.
