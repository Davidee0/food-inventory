# Notes

**Done:** US1-US8 (add, list, edit, delete with confirm, validation, mobile, category dropdown, category CRUD). Optional US9-13 not built.
**API:** same paths, status codes and messages as the Node reference; snake_case JSON (`itemCount` only in the 409). Swagger at `/swagger` with request bodies.
**Decision:** .NET 8 + EF Core/Npgsql on hand-written SQL scripts (no migrations). Controllers read the raw JSON body so wrong types give 400, never coerced.
**Decision:** names compare and sort on a lower-case key computed in the app (`ToLowerInvariant`), so Æ Ø Å work in any DB locale. `categories.name_key` is UNIQUE.
**Decision:** dates are `date` columns / `YYYY-MM-DD` strings; Angular builds "today" from local y/m/d. The app never seeds; `seed_data.sql` refuses a non-empty DB.
**Decision:** native `<dialog>`, no UI library; Save on an invalid form shows all messages and sends nothing.
**Tests:** 103 xUnit (fresh PostgreSQL database per test, built from the real SQL scripts) + 61 Karma specs (dates incl. time zones, validation, UI texts and failure states).
**Checked by hand** with Playwright at 360px: demo script, offline/500 paths, long names, local-date near midnight.
**Run:** see README (DB scripts, `dotnet run` in `backend`, `npx ng serve` in `frontend`).
**Next:** docker-compose for the DB, CI workflow, optional stories US9-13.
