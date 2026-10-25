-- Food inventory schema (PostgreSQL). Run once against an empty database.
CREATE TABLE locations (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

-- name_key is the lower-case copy of name; uniqueness is case-insensitive (incl. Æ Ø Å).
-- The API computes it with ToLowerInvariant, so it does not depend on the database locale.
CREATE TABLE categories (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(30) NOT NULL,
    name_key VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE items (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    location_id   INTEGER NOT NULL REFERENCES locations (id),
    category_id   INTEGER REFERENCES categories (id) ON DELETE RESTRICT,
    purchase_date DATE NOT NULL,
    best_before   DATE
);

CREATE INDEX ix_items_best_before ON items (best_before);
