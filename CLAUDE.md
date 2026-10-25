# CLAUDE.md

Private food inventory (CBS course project). Required stack: PostgreSQL, ASP.NET Core Web API (C#), Angular. No login; one shared inventory. Optional stories US9-13 (quantity, filters, highlights, sort toggle, locations CRUD) are deliberately NOT built.

## Layout
`database/` SQL scripts · `backend/` API (.NET 8, EF Core + Npgsql, Swagger, CORS for http://localhost:4200) · `backend.Tests/` xUnit · `frontend/` Angular 19 standalone components.

## Commands
`dotnet build backend` · `dotnet test backend.Tests` (needs PostgreSQL, see `TEST_DB_ADMIN`) · `cd frontend && npx ng build`.

## API decisions
- Paths: `/locations`, `/items`, `/items/{id}`, `/categories`, `/categories/{id}`. JSON is snake_case, except `itemCount` in the delete-in-use 409.
- Codes: 201 create, 200 replace/rename, 204 delete, 404 `{message}` (non-numeric ids too), 400 `{errors:{field:msg}}` (one message per field) or `{message:"The request body is not valid JSON."}`, 409 duplicate/in-use, 500 `{message:"Something went wrong on the server."}`.
- Controllers read the raw JSON body (`Services/Json.cs`, `Validation.cs`); wrongly typed values (objects, arrays, numbers for name...) must give 400 and never be stored. Text is trimmed before validating.
- `GET /items` order: `best_before` ascending, nulls last, then name case-insensitive.

## Traps
- **FK enforcement:** `items.category_id` is `ON DELETE RESTRICT`; Postgres enforces it. The API also counts items first for the friendly 409.
- **Case-insensitive unique names:** categories have `name_key` (lower-case copy, UNIQUE) set via `ToLowerInvariant` in the API, not DB `lower()`, so Æ/Ø/Å work in any DB locale. Renaming to another category's name is 409; changing only the case of its own name is fine.
- **Plain dates:** `date` columns, `DateOnly`, `YYYY-MM-DD` strings. Never timestamps. "Today" is the user's LOCAL date: Angular builds it from local year/month/day (`core/date-utils.ts`), never `toISOString()`. Reject 2026-02-30 and any other format.
- **Seed once:** `seed_data.sql` only into a brand-new empty DB; the app never seeds, so deleting all items never brings them back.
- **Mobile:** 16px text everywhere (iOS zoom), controls at least 44px tall, no horizontal scroll at 360px, Add button always visible (fixed bottom bar), zoom stays enabled (no `user-scalable=no`).

## Tests
Each test gets its own throwaway database created from the real `create_tables.sql` + `seed_data.sql` (`TestApp.cs`), so tests never depend on each other. Keep it that way.

## Colours
bg #eef4f3, ink #17433f, line #c9dad6, error #8f1d14 on #ffd9d4, radius 6px, focus outline 3px #0b6bcb, max content width 640px.
