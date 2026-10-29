# CLAUDE.md

Private food inventory (CBS course project). Required stack: PostgreSQL, ASP.NET Core Web API (C#), Angular. No login; one shared inventory.
Built: US1-US8. Optional US9-US12 (quantity, filters, highlights, sort toggle) are deliberately NOT built; US13 (locations CRUD) is built.
It is a port of a Node reference app: same API paths, status codes, messages and tests.

## Commands
`dotnet build` and `dotnet test` in the root (needs PostgreSQL, see `TEST_DB_ADMIN`) · in `frontend/` (Node 22.22.3+): `npx ng build`, `npx ng test --watch=false` (Vitest), `npx prettier --write src`.

## How to work
Less is more: build the smallest working solution, no libraries, abstractions or files a story does not need. Keep the course guide's
requirements: CRUD for two entities (items, categories; locations too), at least four Angular components, a service for the API, a form with two-way binding and validation.

## Frontend
Angular 22 with the same layout as the professor's course project (`ng new` with Angular CLI 22.2.0; project `FoodInventory.NG` like his `CourseAdminSystem.NG`): 2025 file names (`item-form.ts`, `.html`, `.css`,
class `ItemForm`), `app.ts`/`app.html`/`app.css`/`app.spec.ts`/`app.config.ts`/`app.routes.ts`, routing, zoneless, Vitest, Prettier, `.vscode`.
Design "U8" (from Kilian's prototype): `app.html` is a `<router-outlet />` plus a bottom tab bar of `routerLink`s (Add / Inventory / Ate it) and the message bar.
Routed pages: `/items` `ItemList` (start page: search, grouped by category, expiring first with a warning sign), `/add` and `/edit/:id` `ItemForm`
(`:id` arrives as an input through `withComponentInputBinding`), `/eat` `EatList` ("Ate it" deletes, with Undo), `/settings` `Settings`,
`/settings/categories` `CategoryList`, `/settings/locations` `LocationList` (same pattern); any other path goes to `/items`.
Shared parts: `TopBar` (header), `Icon` (fixed SVG drawings). Services: `Api` (HTTP) and `Inventory` (the loaded data as signals, `load()`, the message bar, Undo).
"Soon" = best before within 3 days, "past" = before today (`statusOf` in `rules.ts`). Component styles are in the component's `.css`;
`styles.css` has what all pages share (colours, fields, buttons, item shapes).
Zoneless means no zone.js: state that a template shows must be a signal, because a plain field changed after an `await` does not re-render
(the item form therefore renders only once `ready()` is true).
Form fields stay two-way bound with `[(ngModel)]` (course requirement).

## API decisions
- Paths: `/locations`, `/locations/{id}`, `/items`, `/items/{id}`, `/categories`, `/categories/{id}`. JSON is snake_case through the naming policy in `Program.cs`; only `itemCount` in the delete-in-use 409 is not.
- Codes: 201 create, 200 replace/rename, 204 delete, 404 `{message}` (also for a non-numeric id), 400 `{errors:{field:msg}}` (one message per field), 409 duplicate name, or category/location in use, 500 `{message:"Something went wrong on the server."}`.
- Request bodies bind to `ItemRequest` / `CategoryRequest` / `LocationRequest` (all fields nullable). Malformed JSON or a wrongly typed value (a number as name, an array as id) fails binding and gets 400 `{message:"The request body is not valid JSON."}`, so it is never stored. Ids may also be sent as text ("1").
- `Models/Rules.cs` has the rules and messages; `frontend/src/app/rules.ts` has the same ones for the form. Change both together.
- `GET /items`: `best_before` ascending, nulls last, then name ignoring case.

## Traps
- **FK enforcement:** `items.category_id` (`ON DELETE RESTRICT`) and `items.location_id`; PostgreSQL enforces both. The API counts the items first to answer with a friendly 409.
- **Location names** are unique ignoring case: the table has no `name_key`, so `LocationsController` compares `ToLowerInvariant()` names in C# (the list is short); the DB `UNIQUE` only catches exact duplicates.
- **Case-insensitive unique names:** `categories.name_key` (lower-case copy, UNIQUE) is set with `ToLowerInvariant()` in the API, not with SQL `lower()`, so Æ, Ø and Å work in any database locale.
- **Plain dates:** `date` columns, `DateOnly`, `"YYYY-MM-DD"` strings, never timestamps. "Today" is the user's LOCAL date: `todayLocal()` builds it from local year, month and day, never `toISOString()`.
- **Seed once:** `seed_data.sql` is one transaction and fails on a database that has data (location names are unique). The app never seeds, so deleted items never come back.
- **Mobile:** text 16 px (iPhones zoom in on smaller form text), buttons and fields at least 44 px, no sideways scrolling at 360 px, the tab bar (with Add) always visible, zoom stays enabled.
  The header is not sticky: it would cover a page's sticky `.form-error` message (e.g. a refused delete far down the category list).
- **Add/Edit after a failed load:** the form needs the locations, so it loads first and shows Try again instead of the form without them.

## Tests
Every xUnit test gets its own brand-new database from the real scripts (`ApiTest.cs`). The Vitest spec checks the rules; run it in another zone too
(`TZ=Pacific/Auckland npx ng test --watch=false`), because in UTC a `toISOString()` bug would not show.

## Colours
U8 look: paper #f5f5f1, band #e8e8e3, ink #242424, muted #6d6d68, error #a3200f, warning #f5c400, 2px dark outlines, no rounding, hard offset shadows, monospace labels, one 430px column.
