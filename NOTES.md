# Notes

**Done:** US1-US8: add, list, edit, delete with confirmation, validation, mobile layout, category drop-down, category CRUD.
**Course guide:** 3 related tables with PK/FK and 15 example records; CRUD with GET/POST/PUT/DELETE for items and categories;
4 Angular components (page, item list, item form, categories), an API service, a form with two-way binding and validation; Swagger.
**Decisions:** EF Core on the hand-written SQL scripts (no migrations). Typed request bodies + snake_case naming policy, so Swagger documents
the API and wrongly typed JSON never reaches the code. One `Rules` file per side with the same messages. Plain dates, local "today".
**Tests:** 26 xUnit tests (a fresh PostgreSQL database each) and 3 Karma specs; checked in Chromium at 360 px through the demo script,
offline and server-error paths, and local "today" near midnight in UTC+14 and UTC-11.
**Run:** see README (DB scripts, `dotnet run` in `backend`, `npx ng serve` in `frontend`).
**Next:** the report; optional stories US9-US13 only if there is time.
