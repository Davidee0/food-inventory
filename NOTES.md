# Notes

**Done:** US1-US10: add, view, edit, delete with confirmation, validation, mobile layout, quantity, category drop-down, manage categories, filters;
US11-US12: expiring food marked (warning sign and text, not colour alone), sorted by best before date. Not built: US13 (manage storage locations).
**Project guide:** 3 related tables with PK/FK and 15 example records; CRUD with GET/POST/PUT/DELETE for food items and categories;
7 Angular components (App, TopBar, Icon, ItemList, ItemForm, EatList, CategoryList), services for the API (FoodItemService, CategoryService, StorageLocationService), a form with two-way binding and validation; Swagger.
**Angular 22** like the course project (CLI 22.2.0): U8 design from Kilian's prototype: bottom tab bar Add / Inventory / Ate it, gear for the categories, routes `/items`, `/add`, `/edit/:id`, `/eat`, `/categories`, zoneless with signals, Vitest.
**Decisions:** backend as in the course (CourseAdminSystem): a Model project with entities and repositories on the course's BaseRepository (SQL through Npgsql)
and an API project with `api/[controller]` controllers; camelCase JSON. The form and the API's data annotations check the same rules with the same messages.
Plain dates, local "today". A category that still has food in it cannot be deleted (the foreign key refuses it; the API explains why).
**Tests:** Vitest specs for the form rules, the dates and the tab bar; every API endpoint checked, also with invalid data; the demo script checked in Chromium at 360 px.
**Run:** see README (`database.sql`, `dotnet run --project backend/FoodInventory.API`, `ng serve` in `frontend`).
**Next:** the report; US13 only if there is time.
