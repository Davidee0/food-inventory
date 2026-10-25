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

1. **Database** (once, on an empty database; the seed must not be re-run):
   ```bash
   createdb -U postgres food_inventory
   psql -U postgres -d food_inventory -f database/create_tables.sql
   psql -U postgres -d food_inventory -f database/seed_data.sql
   ```
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
dotnet build backend
dotnet test backend.Tests     # creates and drops a throwaway database per test
cd frontend && npx ng build
```

Tests need a PostgreSQL server; override the admin connection with `TEST_DB_ADMIN`
(default `Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres`).
