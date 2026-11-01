# U8 Food Inventory

Register groceries when you buy them; eat them one at a time or delete them when they are used up.
CBS group project for Designing and Developing Digital Business Applications: PostgreSQL, ASP.NET Core Web API (C#, .NET 10), Angular 22 with Angular Material.

The code follows the professor's CourseAdminSystem from Lectures 4 to 8 step by step: same commands, same project layout, same patterns. Where the professor has a *Student*, this app has a *FoodItem*; where he has a *Teacher*, this app has a *Category* and a *StorageLocation*.

## Run it

You need what Lectures 4 and 5 install: PostgreSQL with pgAdmin, the .NET SDK 10, Node.js 24 LTS (24.15 or newer; Lecture 5 uses 24.21) and the Angular CLI (`npm install -g @angular/cli`).

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
| upgrade to the .NET SDK 10 (slide 30) | `net10.0` in both projects |
| `dotnet new sln` | `backend/FoodInventory.slnx` (SDK 10 makes a `.slnx`) |
| `dotnet new webapi -n CourseAdminSystem.API --use-controllers` | `backend/FoodInventory.API` |
| `dotnet new classlib -n CourseAdminSystem.Model`, packages `Npgsql` and `Microsoft.Extensions.Configuration` | `backend/FoodInventory.Model` |
| `<Nullable>disable</Nullable>` in both projects | both `.csproj` files |
| `ConnectionStrings` with `AppProgDb` above `AllowedHosts` in `appsettings.json` | same |
| `Repositories/BaseRepository.cs` (from the slide) | same file |
| `Entities/Student.cs`: constructor with the id, `DateOnly` for dates | `Entities/FoodItem.cs`, `Category.cs`, `StorageLocation.cs` |
| `Repositories/StudentRepository.cs` (SQL with `@parameters`) | `Repositories/FoodItemRepository.cs`, `CategoryRepository.cs`, `StorageLocationRepository.cs` |
| `Controllers/StudentController.cs`, route `api/[controller]` | `Controllers/FoodItemController.cs`, `CategoryController.cs`, `StorageLocationController.cs` |
| `AddScoped<StudentRepository, StudentRepository>()`, `UseHttpsRedirection` removed | `Program.cs` |
| Swagger: packages `Swashbuckle.AspNetCore` and `Swashbuckle.AspNetCore.SwaggerUI`, `AddEndpointsApiExplorer`, `AddSwaggerGen`, `UseSwagger`, `UseSwaggerUI` | `FoodInventory.API.csproj`, `Program.cs` |
| `launchBrowser` true and `launchUrl` swagger in `Properties/launchSettings.json` | same (port 5050) |

### Lecture 5: Angular frontend

| Professor | This app |
|---|---|
| `ng new CourseAdminSystem.NG` (CSS, no SSR, **N** to zoneless, no AI tools) | `frontend/` (project FoodInventory.NG) |
| `ng generate interface Student` in `model/` | `model/food-item.ts`, `category.ts`, `storage-location.ts` |
| `ng generate component student-card`: a table, `@Input() student`, `table, th, td { border: 1px solid black; }` | `food-item-card` |
| `ng g c StudentList`: `@for` over the cards | `food-item-list` |
| routes in `app.routes.ts`, `routerLink` | same |

### Lecture 6: connecting frontend and backend

| Professor | This app |
|---|---|
| `ng generate service services/StudentService --injectable`: `baseUrl`, `HttpClient`, methods that return an `Observable` | `services/food-item-service.ts`, `category-service.ts`, `storage-location-service.ts` |
| `provideHttpClient()` | `app.config.ts` |
| `implements OnInit`, `ngOnInit()` calls the service and `subscribe`s | every list and form component |
| `console.log('API response:', ...)` and `console.error(...)` in the list | `food-item-list` |
| `ChangeDetectorRef` and `this.cdr.markForCheck()` (slide 33) | after every `subscribe` that stores data (see "Good to know") |
| `app.UseCors(...)` above `app.UseAuthorization()` | `Program.cs` |
| Delete button in the card | `deleteFoodItem()` in `food-item-card` |

### Lecture 7: validation

| Professor | This app |
|---|---|
| `ng generate component EditStudent`, Edit and Delete side by side in a `colspan="2"` row | `edit-food-item`, `food-item-card.html` |
| route `edit-student/:id`, `withComponentInputBinding()`, `@Input() id`, `router.navigate(["edit-student", id])` | `edit-food-item/:id` |
| `@if (student) { ... }` around the form (the good practice on slide 48) | `edit-food-item.html` |
| `FormsModule`, `[(ngModel)]`, `updateStudent()` with `PUT`, then back to the list | `updateFoodItem()` |
| field names that match the API (slide 53) | `model/food-item.ts` |
| `required`, `pattern="\d+"`, `#firstName="ngModel"`, `@if (firstName.invalid)` | same, for name, quantity and purchase date |
| "Error in data" `@else` the Update button | same |
| zone.js (slide 47) | answered N to zoneless in `ng new`: `zone.js` is in `angular.json` and `provideZoneChangeDetection` in `app.config.ts` |

### Lecture 8: Angular Material

| Professor | This app |
|---|---|
| `ng add @angular/material` (Azure/Blue) | `src/material-theme.scss` and the fonts in `index.html` |
| `mat-toolbar` with a `mat-icon-button` and a `mat-menu` of `routerLink` buttons, `.mat-toolbar` colour in `app.css` | `app.html`, `app.css` |
| `ng g c AddStudent`, route and menu item | `add-food-item` |
| Reactive Forms (`FormControl`, `FormGroup`, `Validators`), `mat-form-field`, `matInput`, `mat-error`, Add disabled while invalid | `add-food-item` |
| `addStudent()`: `console.log('Data not valid')`, `subscribe({ next, error })`, back to the list | `addFoodItem()` |

## Theory from the lectures in the app

| Lecture | Theory | Where it shows |
|---|---|---|
| 4 | REST: resources as endpoints, GET, POST, PUT, DELETE, stateless, JSON | `/api/FoodItem`, `/api/Category`, `/api/StorageLocation` in Swagger |
| 4 | layers: frontend, Web API, business logic, database | `frontend/`, `FoodInventory.API`, `FoodInventory.Model`, `database.sql` |
| 5 | components, templates, services, routing | one folder per component, `services/`, `app.routes.ts` |
| 5 | components talking: parent to child (input), child to parent (output) | `[foodItem]` and `(changed)` on `<app-food-item-card>` |
| 6 | interpolation `{{ }}`, property binding `[ ]`, event binding `( )`, `@if`, `@for` with `track` | every template |
| 6 | dependency injection, `@Injectable({ providedIn: 'root' })` | the services, injected in the constructors |
| 6 | signals | not used: the hands on code uses plain fields, so does this app |
| 7 | validation types: required, range, format, business logic, cross field | name required, quantity at least 1, whole number pattern, a used category cannot be deleted, best before not before purchase |
| 7 | validation layers: client, server, database | the forms; `[Required]` and `[Range]` on the entities; `not null`, `check` and foreign keys |
| 7 | best practices: errors after interaction, clear messages, disable submit when invalid | Material errors after a field is touched, one message per rule, Add and Save disabled |
| 8 | Material components, theming, accessibility | toolbar, menu, form field, input, select, button, icon; `material-theme.scss`; `aria-label` on the menu button |

Theory with no code (for the report and the exam): business value of Web APIs, Angular in the market, UX principles, product mindset and product metrics, Material design principles.

## Where the app differs from the slides, on purpose

1. **Category and storage location** have one page each (add, rename, delete in one table) instead of the Teacher set (card, list, edit, add): they only have a name.
2. **`frontend/` is the Angular project** itself; the professor has `Frontend/CourseAdminSystem.NG/`.
3. **No indigo-pink import** (Lecture 8, slide 26): `ng add` already added the Azure/Blue theme in `material-theme.scss`. Restart `ng serve` after `ng add` so the theme loads.
4. **`markForCheck()` after every `subscribe`** that stores data, not only in the list: Angular 22 needs it everywhere (see "Good to know").
5. **`track foodItem.id`** instead of `track $index`, as in the `@for` example of Lecture 6.
6. Generated with `--skip-tests`, and without the template's WeatherForecast sample and https profile.

## What the app adds to the lectures

Each one is a few lines, in the file named:

1. **Filters** by category and storage location: two `<select>` with `[(ngModel)]` and `filteredFoodItems()` (`food-item-list`).
2. **Expiring food**: the API sorts by best before date (`order by` in `FoodItemRepository`); the card shows ⚠ Expired or ⚠ Expires soon (3 days or less) with `daysLeft()` (`food-item-card`).
3. **Ate one**: the quantity goes down by 1 with a `PUT`; eating the last one deletes the item (`food-item-card`).
4. **Delete asks first** with `confirm()`, and the card tells the list to load again with `@Output() changed` (Lecture 5, components talking "child to parent").
5. **Categories and storage locations** pages: add, rename and delete in one table (`category-list`, `storage-location-list`). One that still has food cannot be deleted: the foreign key refuses it, the API answers 409 Conflict with a message, and the page shows it with `alert()`.
6. **Names instead of ids**: a `left join` in `FoodItemRepository` gives `categoryName` and `storageLocationName` (the "we can fix that at a later stage" from Lecture 7, slide 54), and the forms use drop downs (`<select>`, `mat-select`).
7. **Optional fields**: best before date and category may be empty (`null`).
8. **Cross field check**: the best before date cannot be before the purchase date (both forms, and a `check` in the database).
9. **Small helpers**: the start page opens the food list (`redirectTo` in `app.routes.ts`); the purchase date starts at today (`formatDate`); names have a `maxlength` like their database columns.

## Good to know

* **Angular 22 makes every component OnPush.** Data that arrives later from the API is only shown after `this.cdr.markForCheck()`. That is why every `subscribe` that stores data calls it, as on Lecture 6, slide 33. Clicks and typing in the page update it by themselves.
* **Npgsql 10 reads a `date` column as `DateOnly`**, so the repository casts with `(DateOnly)data["purchase_date"]`, matching `DateOnly` in the entity (Lecture 4, slide 35).
* Dates travel as text `"YYYY-MM-DD"`, so they never shift with the time zone. An emptied date field gives `''`; the forms send `null` instead.

## Troubleshooting (notes from the slides)

* pgAdmin says "new locale provider (libc) does not match locale provider of the template database": choose `template0` on the Definition tab (Lecture 4, slide 31).
* "address already in use" for port 5050: `lsof -i :5050`, then `kill <PID>` (Lecture 4, slide 37).
* Swagger gives a database error: check the password and the other details of `AppProgDb` in `appsettings.json` (Lecture 4, slide 38).
* The food list stays empty: check that PostgreSQL and the API run, that Swagger returns data, that `baseUrl` in the services uses port 5050, and look at the browser's JavaScript console (Lecture 6, slide 33).
* `npm error code EACCES`: `sudo npm install` (Lecture 6, slide 30).
* "zsh: fork failed: resource temporarily unavailable": too many processes; restart the computer (Lecture 5, slide 53).

## Structure

```
database.sql                  3 tables with primary and foreign keys, 19 example rows
backend/
  FoodInventory.slnx
  FoodInventory.API/          Program.cs, appsettings.json, Properties/launchSettings.json, Controllers/
  FoodInventory.Model/        Entities/, Repositories/
frontend/                     the Angular project FoodInventory.NG
  src/material-theme.scss     the theme from ng add @angular/material
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
