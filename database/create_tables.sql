-- Food inventory schema for PostgreSQL. Run once on an empty database, then run seed_data.sql.

-- Fixed list: Fridge, Freezer, Pantry.
CREATE TABLE locations (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

-- name_key is the lower-case copy of name, so names are unique ignoring case (also Æ, Ø and Å).
CREATE TABLE categories (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(30) NOT NULL,
    name_key VARCHAR(30) NOT NULL UNIQUE
);

-- Dates are plain dates. A category that is still used by an item cannot be deleted (RESTRICT).
CREATE TABLE items (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    location_id   INTEGER NOT NULL REFERENCES locations (id),
    category_id   INTEGER REFERENCES categories (id) ON DELETE RESTRICT,
    purchase_date DATE NOT NULL,
    best_before   DATE
);
