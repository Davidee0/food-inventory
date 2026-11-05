# Notes

**Done:** US1-US8: add, list, edit, delete with confirmation, validation, mobile layout, category drop-down, category CRUD.
**Course guide:** 3 related tables with PK/FK and 15 example records; CRUD with GET/POST/PUT/DELETE for items and categories;
6 Angular components (App, ItemList, ItemCard, ItemForm, CategoryList, CategoryCard), an API service, a form with two-way binding and validation; Swagger.
**Like the course project** (lecture notes L04, L05): `Backend/` with `FoodInventory.API` + `FoodInventory.Model` (entities, `BaseRepository` and
repositories with Npgsql, `AppProgDb`), .NET 10, routes `api/[controller]`; `Frontend/FoodInventory.NG` (`ng new`, CLI 22.2.0): `model/` interfaces,
list + card with `@Input`/`@Output`, nav list + router outlet in `app.html`, zoneless with signals, Vitest.
**Decisions:** typed request bodies (dates as text), so Swagger documents the API and wrongly typed JSON never reaches the code.
One `Rules` file per side with the same messages. Plain dates, local "today". camelCase JSON (.NET default).
**Tests:** 26 xUnit tests (a fresh PostgreSQL database each) and 15 Vitest tests; checked in Chromium at 360 px through the demo script,
offline and server-error paths, and local "today" near midnight in UTC+14 and UTC-11.
**Run:** see README (DB scripts, `dotnet run --project FoodInventory.API` in `Backend`, `npx ng serve` in `Frontend/FoodInventory.NG`).
**Docs:** `BACKLOG.md` (Product Goal, US1-US13, acceptance criteria, Definition of Done), `ARCHITECTURE.md` (layers, ER model, exam questions), Figma (README).
**Next:** the report (max 10 pages); optional stories US9-US13 only if there is time.
