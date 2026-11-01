-- Food inventory database. Run once on an empty database (Lecture 4):
-- pgAdmin > create the database food_inventory > Query Tool on it > open this file > run the whole script.

create table storage_location (
    id   serial primary key,
    name varchar(30) not null
);

create table category (
    id   serial primary key,
    name varchar(30) not null
);

-- The foreign keys: a category or storage location that still has food in it cannot be deleted.
create table food_item (
    id                  serial primary key,
    name                varchar(50) not null,
    quantity            integer not null check (quantity > 0),
    purchase_date       date not null,
    best_before_date    date,                                                -- optional
    category_id         integer references category (id),                    -- optional
    storage_location_id integer not null references storage_location (id),
    check (best_before_date >= purchase_date)
);

insert into storage_location (name) values ('Fridge'), ('Freezer'), ('Pantry');

insert into category (name) values ('Dairy'), ('Vegetables'), ('Fruit'), ('Meat and fish'), ('Drinks'), ('Other');

-- Dates are relative to today, so some food is always about to expire in the demo.
insert into food_item (name, quantity, purchase_date, best_before_date, category_id, storage_location_id) values
    ('Milk',           1, current_date - 3,  current_date + 2,   1, 1),
    ('Yogurt',         4, current_date - 2,  current_date + 3,   1, 1),
    ('Chicken breast', 2, current_date - 4,  current_date - 1,   4, 1),
    ('Carrots',        6, current_date - 1,  current_date + 10,  2, 1),
    ('Frozen peas',    1, current_date - 20, current_date + 120, 2, 2),
    ('Frozen berries', 2, current_date - 10, current_date + 200, 3, 2),
    ('Apples',         5, current_date - 2,  current_date + 14,  3, 3),
    ('Pasta',          3, current_date - 15, current_date + 300, 6, 3),
    ('Orange juice',   2, current_date - 5,  current_date + 30,  5, 3),
    ('Rice',           1, current_date - 40, null,               null, 3);
