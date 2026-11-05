# Architecture

How the app is built and why, with pointers to the code. Lecture 1 calls this the blueprint of the system: a layered full-stack application.

## Layers

```mermaid
flowchart LR
  user(["Browser on a phone or a laptop"]) --> ui
  subgraph FE["Frontend: Angular 22, Frontend/FoodInventory.NG (localhost:4200)"]
    ui["Components<br/>ItemList, ItemCard, ItemForm,<br/>CategoryList, CategoryCard"] --> svc["Api service<br/>api.ts"]
  end
  svc -- "HTTP + JSON (REST)<br/>/api/Item, /api/Category, /api/Location" --> ctrl
  subgraph BE["Backend: ASP.NET Core Web API, .NET 10 (localhost:5000)"]
    ctrl["Controllers + Rules.cs<br/>FoodInventory.API"] --> repo["Repositories + BaseRepository<br/>FoodInventory.Model"]
  end
  repo -- "SQL with parameters (Npgsql)" --> db[("PostgreSQL<br/>locations, categories, items")]
```

| Layer (lecture 1) | Where | What it does |
|---|---|---|
| Presentation | `Frontend/FoodInventory.NG/src/app` | Shows the data, checks the form, calls the API through one service |
| Application (Web API) | `Backend/FoodInventory.API` | Receives HTTP requests, checks the rules, answers with JSON and status codes |
| Data | `Backend/FoodInventory.Model` + PostgreSQL | One repository per table runs the SQL; the database keeps the data and enforces the keys |

Each layer only talks to the next one, as in lecture 5's restaurant picture: the frontend is the dining room, the API is the waiter
and the backend is the kitchen. The API is stateless (lecture 4): every request carries everything it needs.

## Database

```mermaid
erDiagram
  LOCATIONS ||--o{ ITEMS : "stores"
  CATEGORIES |o--o{ ITEMS : "groups"
  LOCATIONS {
    int id PK
    varchar name "UNIQUE"
  }
  CATEGORIES {
    int id PK
    varchar name
    varchar name_key "UNIQUE, lower-case copy of name"
  }
  ITEMS {
    int id PK
    varchar name
    int location_id FK "NOT NULL"
    int category_id FK "NULL, ON DELETE RESTRICT"
    date purchase_date
    date best_before "NULL"
  }
```

- Every item has exactly one storage location and at most one category. A category that items still use cannot be deleted:
  the database refuses it (`ON DELETE RESTRICT`), and the API answers first with a clear 409 message.
- `name_key` makes category names unique ignoring case ("Dairy" = "dairy"); the API fills it with `ToLowerInvariant()`.
- Dates are plain `date` values (no time, no time zone), sent as `"YYYY-MM-DD"`.
- Scripts: `Database/create_tables.sql`, then `Database/seed_data.sql` (one transaction, runs once).

## One request from start to end: adding an item

1. **Form** (`item-form`): the fields are two-way bound with `[(ngModel)]`. `validateItem` (`rules.ts`) checks them; a wrong field
   gets its message and nothing is sent.
2. **Service** (`api.ts`): `POST http://localhost:5000/api/Item` with
   `{"name":"Milk","locationId":1,"categoryId":1,"purchaseDate":"2026-11-01","bestBefore":"2026-11-06"}`.
3. **ASP.NET Core** (`Program.cs`): CORS lets the Angular app call the API; the JSON is bound to `ItemRequest`
   (malformed JSON gets 400 `{"message":"The request body is not valid JSON."}`).
4. **Controller** (`ItemController.Post`): `Rules.Item` checks the same rules again, and the repositories check that the location and
   the category exist. Errors: 400 `{"errors":{"name":"Enter a name."}}`.
5. **Repository** (`ItemRepository.InsertItem`): `INSERT ... RETURNING id` with parameters, then `GetItemById` joins the location and
   category names. Answer: **201 Created** with the item as JSON.
6. **Back in Angular**: the form emits `saved`, `ItemList` loads `GET /api/Item` again (sorted by the database), the signals change
   and the page shows the new list.

## API

| Method and path | Success | Errors |
|---|---|---|
| `GET /api/Item` | 200, soonest best before date first | |
| `GET /api/Item/{id}` | 200 | 404 `Item not found.` |
| `POST /api/Item` | 201 + the item | 400 one message per field |
| `PUT /api/Item/{id}` (the whole item) | 200 + the item | 400, 404 |
| `DELETE /api/Item/{id}` | 204 | 404 |
| `GET /api/Category` | 200, with `itemCount`, by name | |
| `POST /api/Category` | 201 | 400 name, 409 `Dairy already exists.` |
| `PUT /api/Category/{id}` | 200 | 400, 404, 409 |
| `DELETE /api/Category/{id}` | 204 | 404, 409 `Dairy is used by 1 item and cannot be deleted.` |
| `GET /api/Location` | 200 (Fridge, Freezer, Pantry) | |

Any unexpected error: 500 `{"message":"Something went wrong on the server."}`. Swagger documents it all at `/swagger`.

## Validation in two places

The form checks first, so the user gets a message right away (lecture 5: real-time validation, smart error messages). The API checks
again, because a request can come from anywhere (Swagger, Postman). Both use the same rules and messages: `Rules.cs` and `rules.ts`.

## Security, ethics and accessibility (lecture 2)

- **SQL injection:** every query uses parameters (`@name`), never text glued into SQL.
- **XSS:** Angular escapes everything shown with `{{ }}`.
- **CORS:** only the Angular app (`http://localhost:4200`) may call the API from a browser.
- **Secrets:** a shared cloud database gets its connection string from an environment variable, never from a file in git.
- **Privacy:** no accounts and no personal data, only the food list.
- **Accessibility:** a label for every field; `aria-invalid` and `aria-describedby` link a field to its message, and the focus moves to
  the first wrong field. Buttons and fields are at least 44 px and text is at least 16 px. All text has at least 4.5:1 contrast
  (ink on background 9.9:1, error text 6.9:1, grey text 5.6:1) and field borders 3:1. Everything works with the keyboard.

## Tests

- **xUnit** (`Backend/FoodInventory.Tests`, 26 tests): every test runs the real API on a brand-new PostgreSQL database built from the
  real scripts. They cover create/read/replace/delete, every validation message, ids sent as text, malformed JSON, the sort order,
  category rules and the foreign key.
- **Vitest** (`Frontend/FoodInventory.NG`, 15 tests): the form rules and "today" in the local time zone, plus a spec for every
  component with TestBed and a mocked API (`vi.fn()`).
- **By hand:** the demo script in the README, at 360 px.

## Strengths and limitations

| Strengths | Limitations (and what would fix them) |
|---|---|
| Layered like the course project: easy to explain and to change one layer at a time | No login: anyone who can reach the app can change the list (authentication, a later lecture) |
| Plain SQL in repositories: you can read exactly what the database does | One shared inventory: no households or users (would need accounts and a households table) |
| The same rules and messages in the form and in the API | Synchronous repositories: simple, but async would serve more users at once |
| Tests run against a real PostgreSQL database | Runs on localhost: deploying would need a host for the API and a cloud database |
| Phone-first, accessible layout | No paging: fine for a household list, not for thousands of items |

## Business value (lecture 1)

The app helps a household waste less food, and less waste saves money. As a product it could grow with accounts, reminders before food
goes off, and shared households. That would bring new requirements: authentication, hosting, and GDPR for personal data.

## Questions for the oral exam

- **What is a Web API, and why REST?** A contract over HTTP: endpoints, methods, JSON in and out, status codes. REST uses the standard
  methods: GET reads, POST creates, PUT replaces, DELETE deletes. It is stateless. See `Controllers/`.
- **What does a repository do?** It holds all the SQL for one table. `BaseRepository` (from the course) opens the connection and runs the
  command; controllers never write SQL. See `FoodInventory.Model/Repositories`.
- **Where is dependency injection?** `builder.Services.AddScoped<ItemRepository, ItemRepository>()` in `Program.cs`. ASP.NET Core creates
  one repository per request and passes it to the controller's constructor.
- **What do `[ApiController]` and `[Route("api/[controller]")]` do?** An invalid body gets a 400 automatically, and the URL comes from
  the class name: `ItemController` is `/api/Item`.
- **How do the components talk to each other?** `@Input()` passes data down (list to card, list to form). `@Output()` reports events up
  (the card's edit and remove, the form's saved and closed). The `Api` service is shared by all of them.
- **What is two-way binding?** `[(ngModel)]` keeps a form field and a variable equal in both directions (`item-form.html`).
- **Why signals?** The app is zoneless: Angular re-renders when a signal changes, for example when the HTTP answer arrives.
- **How does routing work?** `app.routes.ts` maps `/items` and `/categories` to components. The links use `routerLink`, and the page
  appears in `<router-outlet />`.
- **What happens when you delete a category that is in use?** The API counts its items and answers 409 with the count; the database
  would refuse it anyway (`ON DELETE RESTRICT`).
- **Why are dates text?** A best before date has no time and no time zone. "Today" comes from the local year, month and day
  (`todayLocal`), because `toISOString()` gives the UTC day, which is wrong around midnight.
