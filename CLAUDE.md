# CLAUDE.md

Private food inventory (CBS course project). Required stack: PostgreSQL, ASP.NET Core Web API (C#), Angular. No login; one shared inventory. Optional stories US9-13 (quantity, filters, highlights, sort toggle, locations CRUD) are deliberately NOT built.

## Layout
`database/` SQL scripts · `backend/` API (.NET 8, EF Core + Npgsql, Swagger, CORS for http://localhost:4200) · `backend.Tests/` xUnit · `frontend/` Angular 19 standalone components.

## Commands
`dotnet build` · `dotnet test` (root `FoodInventory.sln`; needs PostgreSQL, see `TEST_DB_ADMIN`) · `cd frontend && npx ng build` · `cd frontend && npm run test:ci` (headless Chrome, `CHROME_BIN`).

## API decisions
- Paths: `/locations`, `/items`, `/items/{id}`, `/categories`, `/categories/{id}`. JSON is snake_case, except `itemCount` in the delete-in-use 409.
- Codes: 201 create, 200 replace/rename, 204 delete, 404 `{message}` (non-numeric ids too), 400 `{errors:{field:msg}}` (one message per field) or `{message:"The request body is not valid JSON."}`, 409 duplicate/in-use, 500 `{message:"Something went wrong on the server."}`.
- Controllers read the raw JSON body (`Services/Json.cs`, `Validation.cs`); wrongly typed values (objects, arrays, numbers for name...) must give 400 and never be stored. Text is trimmed before validating. Ids in JSON must be whole numbers (`1` and `1.0` ok, `"1"` not).
- Text that can never be stored (invalid UTF-8, lone surrogate, NUL) is a 400 "not valid JSON", never a 500.
- Route ids are digits only: `+1`, ` 1`, `1.0`, `abc` give 404.
- `GET /items` order: `best_before` ascending, nulls last, then name case-insensitive, then id. Sorted in the app on `NameKeys.Of(name)` (not in SQL) so it does not depend on DB collation. Same key orders `GET /categories`.
- Swagger: the controllers have no bound body, so POST/PUT bodies are documented with `[JsonBody(type, example)]` (`Swagger/`). Keep it when adding endpoints.

## Traps
- **FK enforcement:** `items.category_id` is `ON DELETE RESTRICT`; Postgres enforces it. The API also counts items first for the friendly 409.
- **Case-insensitive unique names:** categories have `name_key` (lower-case copy, UNIQUE) set via `ToLowerInvariant` in the API, not DB `lower()`, so Æ/Ø/Å work in any DB locale. Renaming to another category's name is 409; changing only the case of its own name is fine.
- **Plain dates:** `date` columns, `DateOnly`, `YYYY-MM-DD` strings. Never timestamps. "Today" is the user's LOCAL date: Angular builds it from local year/month/day (`core/date-utils.ts`), never `toISOString()`. Reject 2026-02-30 and any other format.
- **Seed once:** `seed_data.sql` only into a brand-new empty DB; the app never seeds, so deleting all items never brings them back. The script itself refuses to run on a non-empty DB (guard + transaction).
- **Mobile:** 16px text everywhere (iOS zoom), controls at least 44px tall, no horizontal scroll at 360px, Add button always visible (fixed bottom bar), zoom stays enabled (no `user-scalable=no`).

- **Add/Edit after a failed load:** the form needs the locations, so `openAdd/openEdit` reload first and do not open if that fails.

## Tests
Each test gets its own throwaway database created from the real `create_tables.sql` + `seed_data.sql` (`TestApp.cs`), so tests never depend on each other. Keep it that way. Read-only contract tests share one fixture database.
Frontend: Karma specs next to the code. Run them in several zones to check the date logic, e.g. `TZ=Pacific/Auckland npm run test:ci` (in UTC a `toISOString()` bug would go unnoticed).

## Colours
bg #eef4f3, ink #17433f, line #c9dad6, error #8f1d14 on #ffd9d4, radius 6px, focus outline 3px #0b6bcb, max content width 640px.
