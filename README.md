# U8 Food Inventory

Register groceries when you buy them; eat them one at a time or delete them when they are used up.
CBS group project for Designing and Developing Digital Business Applications: PostgreSQL, ASP.NET Core Web API (C#), Angular with Angular Material.

The code follows the professor's CourseAdminSystem from Lectures 4 to 8 step by step: same project layout, same commands, same patterns. Where the professor has a *Student*, this app has a *FoodItem*; where he has a *Teacher*, this app has a *Category* and a *StorageLocation*.

## Run it

You need: PostgreSQL with pgAdmin, the .NET 8 SDK (with only .NET 10 installed, add the .NET 8 runtime), Node.js 24 LTS (24.15 or newer; Lecture 5 uses 24.21), and the Angular CLI (`npm install -g @angular/cli`).

1. **Database** (Lecture 4): in pgAdmin create the database `food_inventory`, open the Query Tool on it and run the whole `database.sql`.
2. **Backend** (Lecture 4): put your PostgreSQL password in `backend/FoodInventory.API/appsettings.json` (connection string `AppProgDb`), then:
   ```bash
   cd backend
   dotnet build
   dotnet run --project FoodInventory.API
   ```
   Swagger: http://localhost:5050/swagger
3. **Frontend** (Lecture 5): in a second terminal:
   ```bash
   cd frontend
   npm install
   ng serve
   ```
   Open http://localhost:4200

## Where each lecture is in the code

### Lecture 4: Web API and database

| Professor (CourseAdminSystem) | This app |
|---|---|
| `dotnet new sln`, `dotnet new webapi -n CourseAdminSystem.API --use-controllers` | `backend/FoodInventory.sln`, `backend/FoodInventory.API` |
| `dotnet new classlib -n CourseAdminSystem.Model` with `Npgsql` and `Microsoft.Extensions.Configuration` | `backend/FoodInventory.Model` |
| `<Nullable>disable</Nullable>` in both projects | both `.csproj` files |
| `ConnectionStrings` with `AppProgDb` in `appsettings.json` | same |
| `Repositories/BaseRepository.cs` (from the slide) | same file |
| `Entities/Student.cs` (constructor with the id) | `Entities/FoodItem.cs`, `Category.cs`, `StorageLocation.cs` |
| `Repositories/StudentRepository.cs` (SQL with `@parameters`) | `Repositories/FoodItemRepository.cs`, `CategoryRepository.cs`, `StorageLocationRepository.cs` |
| `Controllers/StudentController.cs`, route `api/[controller]` | `Controllers/FoodItemController.cs`, `CategoryController.cs`, `StorageLocationController.cs` |
| `AddScoped<StudentRepository, StudentRepository>()`, Swagger, `UseHttpsRedirection` removed | `Program.cs` |
| port in `Properties/launchSettings.json`, `launchUrl` swagger | same (port 5050) |

### Lecture 5: Angular frontend

| Professor | This app |
|---|---|
| `ng new CourseAdminSystem.NG` (CSS, no SSR, **N** to zoneless) | `frontend/` (project FoodInventory.NG) |
| `ng generate interface Student` in `model/` | `model/food-item.ts`, `category.ts`, `storage-location.ts` |
| `student-card`: a table, `@Input() student` | `food-item-card` |
| `student-list`: `@for` over the cards | `food-item-list` |
| routes in `app.routes.ts`, `routerLink` | same |

### Lecture 6: connecting frontend and backend

| Professor | This app |
|---|---|
| `ng generate service services/StudentService --injectable`: `baseUrl`, `HttpClient`, methods that return an `Observable` | `services/food-item-service.ts`, `category-service.ts`, `storage-location-service.ts` |
| `provideHttpClient()` | `app.config.ts` |
| `ngOnInit()` calls the service and `subscribe`s | every list and form component |
| `ChangeDetectorRef` and `this.cdr.markForCheck()` (slide 33) | after every `subscribe` that stores data (see "Good to know") |
| `app.UseCors(...)` above `app.UseAuthorization()` | `Program.cs` |
| Delete button in the card | `deleteFoodItem()` in `food-item-card` |

### Lecture 7: validation

| Professor | This app |
|---|---|
| `edit-student` on the route `edit-student/:id`, `withComponentInputBinding()`, `@Input() id` | `edit-food-item` on `edit-food-item/:id` |
| `FormsModule`, `[(ngModel)]` | `edit-food-item.html` |
| `required`, `pattern="\d+"`, `#firstName="ngModel"`, `@if (firstName.invalid)` | same, for name, quantity and purchase date |
| "Error in data" `@else` the Update button | same |
| `updateStudent()` with `PUT`, then back to the list | `updateFoodItem()` |
| zone.js | answered N to zoneless in `ng new`: `zone.js` is in `angular.json` and `provideZoneChangeDetection` in `app.config.ts`, so the extra zone.js step on slide 47 is not needed |
| validation in layers | frontend (the forms), server (`[Required]` and `[Range]` on the entities), database (`not null`, `check`, foreign keys in `database.sql`) |

### Lecture 8: Angular Material

| Professor | This app |
|---|---|
| `ng add @angular/material` (Azure/Blue) | `src/material-theme.scss` and the fonts in `index.html` (this theme already styles everything, so the indigo-pink import from slide 26 is not needed) |
| `mat-toolbar` with a `mat-menu` of `routerLink` buttons | `app.html` |
| `add-student`: Reactive Forms (`FormControl`, `FormGroup`, `Validators`), `mat-form-field`, `mat-error`, Add disabled while invalid | `add-food-item` |
| `addStudent()` in the service | `addFoodItem()` |

## What the app adds to the lectures

Each one is a few lines, in the file named:

1. **Filters** by category and storage location: two `<select>` with `[(ngModel)]` and `filteredFoodItems()` (`food-item-list`).
2. **Expiring food**: the API sorts by best before date (`order by` in `FoodItemRepository`); the card shows ⚠ Expired or ⚠ Expires soon (3 days or less) with `daysLeft()` (`food-item-card`).
3. **Ate one**: the quantity goes down by 1 with a `PUT`; eating the last one deletes the item (`food-item-card`).
4. **Delete asks first** with `confirm()`, and the card tells the list to load again with `@Output() changed` (Lecture 5, components talking "child to parent").
5. **Categories and storage locations** pages: add, rename and delete in one table (`category-list`, `storage-location-list`). One that still has food cannot be deleted: the foreign key refuses it, the API answers 409 Conflict with a message, and the page shows it with `alert()`.
6. **Names instead of ids**: a `left join` in `FoodItemRepository` gives `categoryName` and `storageLocationName` (the "we can fix that at a later stage" from Lecture 7, slide 54).
7. **Optional fields**: best before date and category may be empty (`null`).
8. **Cross field check**: the best before date cannot be before the purchase date (both forms, and a `check` in the database).

## Good to know

* **Angular 22 makes every component OnPush.** Data that arrives later from the API is only shown after `this.cdr.markForCheck()`. That is why every `subscribe` that stores data calls it, as on Lecture 6, slide 33. Clicks and typing in the page update it by themselves.
* Dates travel as text `"YYYY-MM-DD"` (C# `DateOnly`, a `date` column in PostgreSQL), so they never shift with the time zone.
* The components were made with `ng generate ... --skip-tests`; `ng test` runs `app.spec.ts`.

## Structure

```
database.sql                  3 tables with primary and foreign keys, 19 example rows
backend/
  FoodInventory.sln
  FoodInventory.API/          Program.cs, appsettings.json, Properties/launchSettings.json, Controllers/
  FoodInventory.Model/        Entities/, Repositories/
frontend/                     the Angular project FoodInventory.NG
  src/app/
    app.html, app.ts          toolbar with the menu, router outlet
    app.routes.ts             food-items, add-food-item, edit-food-item/:id, categories, storage-locations
    model/, services/
    food-item-list/, food-item-card/, add-food-item/, edit-food-item/
    category-list/, storage-location-list/
```

## Demo script

1. **Food**: Chicken breast is expired, Milk and Yogurt expire soon. Filter Category: Dairy, then All.
2. **Menu, Add food**: click into the fields and leave them empty (messages appear, Add stays disabled), then add Bread.
3. **Edit** Bread: empty the name ("Error in data"), type it again, Update.
4. **Ate one** on Bread, then **Delete** it (it asks first).
5. **Categories**: add Snacks, rename it, delete it; try to delete Dairy (refused, it still has food).
6. **Storage locations**: the same with Cellar and Fridge.

## Project guide checklist

* Several related tables with PK and FK, at least 10 records: `storage_location`, `category`, `food_item`, 19 rows.
* CRUD with GET, POST, PUT and DELETE for at least two entities: food items, categories, storage locations.
* At least 4 Angular components: 7 (App, FoodItemList, FoodItemCard, AddFoodItem, EditFoodItem, CategoryList, StorageLocationList).
* Services for the API: 3.
* A form with two way binding and basic validation: `edit-food-item` (`[(ngModel)]`), plus the Reactive Form in `add-food-item`.
