-- Food inventory. Run once on an empty database (pgAdmin Query Tool).

create table storage_location (
    id   serial primary key,
    name varchar(30) not null
);

create table category (
    id   serial primary key,
    name varchar(30) not null
);

-- A category or storage location that still has food in it cannot be deleted: the foreign key refuses it.
create table food_item (
    id                  serial primary key,
    name                varchar(50) not null,
    quantity            integer not null check (quantity > 0),
    purchase_date       date not null,
    best_before_date    date,
    category_id         integer references category (id),
    storage_location_id integer not null references storage_location (id),
    check (best_before_date >= purchase_date)
);

insert into storage_location (name) values ('Fridge'), ('Freezer'), ('Pantry');

insert into category (name) values ('Dairy'), ('Vegetables'), ('Fruit'), ('Meat and fish'), ('Drinks'), ('Other');

insert into food_item (name, quantity, purchase_date, best_before_date, category_id, storage_location_id) values
    ('Milk',           1, current_date - 3,  current_date + 2,   1, 1),
    ('Chicken breast', 2, current_date - 4,  current_date - 1,   4, 1),
    ('Frozen peas',    1, current_date - 20, current_date + 120, 2, 2),
    ('Frozen berries', 2, current_date - 10, current_date + 200, 3, 2),
    ('Pasta',          3, current_date - 15, null,               6, 3),
    ('Orange juice',   2, current_date - 5,  current_date + 30,  5, 3);
