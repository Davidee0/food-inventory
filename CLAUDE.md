# CLAUDE.md

Private food inventory (CBS course project). Required stack: PostgreSQL, ASP.NET Core Web API (C#), Angular. No login; one shared inventory.
Built: US1-US8. Optional US9-US13 (quantity, filters, highlights, sort toggle, locations CRUD) are deliberately NOT built.
It is a port of a Node reference app: same API paths, status codes, messages and tests.

## Commands
`dotnet build` and `dotnet test` in the root (needs PostgreSQL, see `TEST_DB_ADMIN`) · `cd frontend && npx ng build` · `cd frontend && npx ng test --watch=false`.

## How to work
Less is more: build the smallest working solution, no libraries, abstractions or files a story does not need. Keep the course guide's
requirements: CRUD for two entities (items, categories), at least four Angular components, a service for the API, a form with two-way binding and validation.

## API decisions
- Paths: `/locations`, `/items`, `/items/{id}`, `/categories`, `/categories/{id}`. JSON is snake_case through the naming policy in `Program.cs`; only `itemCount` in the delete-in-use 409 is not.
- Codes: 201 create, 200 replace/rename, 204 delete, 404 `{message}` (also for a non-numeric id), 400 `{errors:{field:msg}}` (one message per field), 409 duplicate name or category in use, 500 `{message:"Something went wrong on the server."}`.
- Request bodies bind to `ItemRequest` / `CategoryRequest` (all fields nullable). Malformed JSON or a wrongly typed value (a number as name, an array as id) fails binding and gets 400 `{message:"The request body is not valid JSON."}`, so it is never stored. Ids may also be sent as text ("1").
- `Models/Rules.cs` has the rules and messages; `frontend/src/app/core/rules.ts` has the same ones for the form. Change both together.
- `GET /items`: `best_before` ascending, nulls last, then name ignoring case.

## Traps
- **FK enforcement:** `items.category_id` is `ON DELETE RESTRICT`; PostgreSQL enforces it. The API counts the items first to answer with a friendly 409.
- **Case-insensitive unique names:** `categories.name_key` (lower-case copy, UNIQUE) is set with `ToLowerInvariant()` in the API, not with SQL `lower()`, so Æ, Ø and Å work in any database locale.
- **Plain dates:** `date` columns, `DateOnly`, `"YYYY-MM-DD"` strings, never timestamps. "Today" is the user's LOCAL date: `todayLocal()` builds it from local year, month and day, never `toISOString()`.
- **Seed once:** `seed_data.sql` is one transaction and fails on a database that has data (location names are unique). The app never seeds, so deleted items never come back.
- **Mobile:** text 16 px (iPhones zoom in on smaller form text), buttons and fields at least 44 px, no sideways scrolling at 360 px, the Add button always visible, zoom stays enabled.
- **Add/Edit after a failed load:** the form needs the locations, so `open()` loads again first and does not open the form without them.

## Tests
Every xUnit test gets its own brand-new database from the real scripts (`ApiTest.cs`). The Karma spec checks the rules; run it in another zone too
(`TZ=Pacific/Auckland npx ng test --watch=false`), because in UTC a `toISOString()` bug would not show.

## Colours
bg #eef4f3, ink #17433f, line #c9dad6, error #8f1d14 on #ffd9d4, radius 6px, focus outline 3px #0b6bcb, max content width 640px.
