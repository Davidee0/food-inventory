# Notes

**Done:** US1-US8 (add, list, edit, delete with confirm, validation, mobile, category dropdown, category CRUD). Optional US9-13 not built.
**API:** same paths, status codes and messages as the Node reference; snake_case JSON (`itemCount` only in the 409).
**Decision:** .NET 8 + EF Core/Npgsql mapped onto hand-written SQL scripts (no migrations).
**Decision:** controllers read the raw JSON body so wrong types give 400 instead of being coerced.
**Decision:** category `name_key` (lower-case copy, UNIQUE) is set by the API with `ToLowerInvariant`, so Æ Ø Å work in any DB locale.
**Decision:** dates are `date` columns / `YYYY-MM-DD` strings; Angular builds "today" from local y/m/d. The app never seeds.
**Decision:** native `<dialog>` for forms/confirm, no UI library; Save on an invalid form shows all messages and sends nothing.
**Tests:** 71 xUnit tests, a fresh PostgreSQL database per test built from the real SQL scripts. Frontend checked with Playwright at 360px, no unit tests.
**Run:** see README (DB scripts, `dotnet run` in `backend`, `npx ng serve` in `frontend`).
**Next:** frontend unit tests, docker-compose for the DB, optional stories US9-13.
