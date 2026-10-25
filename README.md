# Food inventory

Private food inventory: register groceries when bought, delete them when used up. No login; one shared inventory.

Stack: PostgreSQL, ASP.NET Core Web API (.NET 8, EF Core + Npgsql), Angular 19.

| Folder | Contents |
|---|---|
| `database/` | `create_tables.sql`, `seed_data.sql` |
| `backend/` | ASP.NET Core Web API (Swagger at `/swagger`) |
| `backend.Tests/` | xUnit integration tests (real PostgreSQL) |
| `frontend/` | Angular app (mobile-first) |

## Run it

Prerequisites: PostgreSQL 14+, .NET 8 SDK, Node 20+.

1. **Database** (once, on an empty database):
   ```bash
   createdb -U postgres food_inventory
   psql -U postgres -d food_inventory -v ON_ERROR_STOP=1 -f database/create_tables.sql
   psql -U postgres -d food_inventory -v ON_ERROR_STOP=1 -f database/seed_data.sql
   ```
   The seed only works on a brand-new empty database: running it again is refused and changes nothing,
   so deleting all items never brings the sample items back.
2. **API** - set the connection string in `backend/appsettings.json` (default: `localhost:5432`, user/password `postgres`), then:
   ```bash
   cd backend
   dotnet run          # http://localhost:5000, Swagger: http://localhost:5000/swagger
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npx ng serve        # http://localhost:4200
   ```

## Tests and builds

```bash
dotnet build                  # from the repo root (FoodInventory.sln), or `dotnet build backend`
dotnet test                   # xUnit; creates and drops a throwaway database per test
cd frontend
npx ng build
npm run test:ci               # Karma/Jasmine in headless Chrome (set CHROME_BIN if Chrome is not found)
```

The xUnit tests need a PostgreSQL server; override the admin connection with `TEST_DB_ADMIN`
(default `Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres`).
