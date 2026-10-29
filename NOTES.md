# Notes

**Done:** US1-US8: add, list, edit, delete with confirmation, validation, mobile layout, category drop-down, category CRUD.
**Course guide:** 3 related tables with PK/FK and 15 example records; CRUD with GET/POST/PUT/DELETE for items and categories;
9 Angular components (App, TopBar, Icon, ItemList, ItemForm, EatList, Settings, UserForm, CategoryList), two services (Api, Inventory), a form with two-way binding and validation; Swagger.
**Angular 22** like the course project (CLI 22.2.0): 2025 file names, U8 design from Kilian's prototype: bottom tab bar Add / Inventory / Ate it, settings gear, routes `/items`, `/add`, `/edit/:id`, `/eat`, `/settings`(`/user`, `/categories`), zoneless with signals, Vitest.
**Decisions:** backend as in the course (CourseAdminSystem): a Model project with entities and repositories on the course's BaseRepository (SQL through Npgsql)
and an API project with `api/[controller]` controllers; camelCase JSON. Plain dates, local "today". Deleting a category keeps its items, without a category.
**Tests:** Vitest specs for the form rules, the dates and the tab bar; checked in Chromium at 360 px through the demo script.
**Run:** see README (`database.sql`, `dotnet run --project backend/FoodInventory.API`, `ng serve` in `frontend`).
**Next:** the report; optional stories US9-US13 only if there is time.
