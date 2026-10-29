# Notes

**Done:** US1-US8: add, list, edit, delete with confirmation, validation, mobile layout, category drop-down, category CRUD; US13 storage location CRUD.
**Course guide:** 3 related tables with PK/FK and 15 example records; CRUD with GET/POST/PUT/DELETE for items, categories and locations;
9 Angular components (App, TopBar, Icon, ItemList, ItemForm, EatList, Settings, CategoryList, LocationList), two services (Api, Inventory), a form with two-way binding and validation; Swagger.
**Angular 22** like the course project (CLI 22.2.0): 2025 file names, U8 design from Kilian's prototype: bottom tab bar Add / Inventory / Ate it, settings gear, routes `/items`, `/add`, `/edit/:id`, `/eat`, `/settings`(`/categories`, `/locations`), zoneless with signals, Vitest.
**Decisions:** EF Core on the hand-written SQL scripts (no migrations). Typed request bodies + snake_case naming policy, so Swagger documents
the API and wrongly typed JSON never reaches the code. One `Rules` file per side with the same messages. Plain dates, local "today".
**Tests:** 26 xUnit tests (a fresh PostgreSQL database each) and 5 Vitest specs; checked in Chromium at 360 px through the demo script,
offline and server-error paths, and local "today" near midnight in UTC+14 and UTC-11.
**Run:** see README (DB scripts, `dotnet run` in `backend`, `npx ng serve` in `frontend`).
**Next:** the report; optional stories US9-US12 only if there is time.
