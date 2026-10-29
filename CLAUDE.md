# CLAUDE.md

Food inventory, CBS course project (Designing and Developing Digital Business Applications). PostgreSQL, ASP.NET Core Web API (C#, .NET 8), Angular 22. No login, no users; one shared inventory.

## How to work
Follow the project guide (DDDBA Project and Exam Guide), the team roadmap and user stories, and the professor's notes (course project CourseAdminSystem). Less is more: no code, libraries or files the app does not need.
Guide: several related tables with PK/FK and at least 10 records; CRUD with GET/POST/PUT/DELETE for at least two entities; at least 4 Angular components; services for the API; a form with two-way binding and basic validation.
Built: US1-US10 (add, view, edit, delete with confirmation, validation, mobile, quantity, category drop-down, manage categories, filters) and US11-US12 (expiring food marked, sorted by best before date). Not built: US13 (manage storage locations).

## Database (`database.sql`)
`storage_location` (fixed: Fridge, Freezer, Pantry), `category`, `food_item` (name, quantity > 0, purchase_date, optional best_before_date not before purchase_date, optional category_id, storage_location_id). A category that still has food in it cannot be deleted: the foreign key refuses it.

## Backend (as in the course)
- `FoodInventory.Model`: `Entities/` (a class per table, constructor with the id, validation as data annotations), `Repositories/` (`XRepository : BaseRepository`; SQL with `@parameters`). `BaseRepository` is the course's file.
- `FoodInventory.API`: `[Route("api/[controller]")]` controllers (`/api/FoodItem`, `/api/Category`, `/api/StorageLocation`) get their repository in the constructor (`AddScoped` in `Program.cs`). PUT gets the whole object, id included; NotFound when the id does not exist; 409 with a message when a category still has food. Port 5050, connection string `AppProgDb`, CORS for http://localhost:4200.
- JSON is camelCase (ASP.NET default). Dates: `date` columns, `DateOnly`, "YYYY-MM-DD".
- The rules and messages in `FoodItem.cs` / `Category.cs` and in `frontend/src/app/rules.ts` are the same: change them together.

## Frontend: design "U8" (Kilian's prototype)
`ng new` project FoodInventory.NG (Angular CLI 22.2.0, zoneless, Vitest, Prettier). `app.html`: `<router-outlet />`, the message bar and a bottom tab bar (Add / Inventory / Ate it).
Pages: `/items` ItemList (filters by category and storage location, grouped by category, expiring first with a warning sign), `/add` and `/edit/:id` ItemForm (`:id` arrives as an input through `withComponentInputBinding`),
`/eat` EatList ("Ate it" deletes after a confirmation), `/categories` CategoryList (the gear in the top bar). Parts: TopBar, Icon.
Data as in class: `model/` (interfaces), `services/` (one per controller; HttpClient, Observables). `inventory.ts` keeps the loaded data as signals for all pages, with `load()`, `remove()` and the message bar.
"Today" is the LOCAL date (`todayLocal()`, never `toISOString()`); "soon" = best before within 3 days, "past" = before today.
Zoneless: state that a template shows must be a signal, because a plain field changed after an `await` does not re-render. Form fields stay two-way bound with `[(ngModel)]`.
Mobile: 16 px text, 44 px buttons and fields, no sideways scrolling at 360 px, the tab bar always visible.
U8 look: paper #f5f5f1, band #e8e8e3, ink #242424, muted #6d6d68, error #a3200f, warning #f5c400, 2px dark outlines, no rounding, hard offset shadows, monospace labels, one 430px column.

## Commands
`dotnet build backend/FoodInventory.sln` · `dotnet run --project backend/FoodInventory.API` · in `frontend/` (Node 22.22.3+): `npx ng serve`, `npx ng build`, `npx ng test --watch=false` (also with `TZ=Pacific/Auckland`), `npx prettier --write src`.
