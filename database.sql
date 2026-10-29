-- Food inventory. Run once on an empty database (pgAdmin Query Tool).

create table location (
    id   serial primary key,
    name varchar(30) not null
);

create table category (
    id   serial primary key,
    name varchar(30) not null
);

-- Deleting a category keeps its items, without a category.
create table item (
    id            serial primary key,
    name          varchar(50) not null,
    location_id   integer not null references location (id),
    category_id   integer references category (id) on delete set null,
    purchase_date date not null,
    best_before   date
);

insert into location (name) values ('Fridge'), ('Freezer'), ('Pantry');

insert into category (name) values ('Dairy'), ('Vegetables'), ('Fruit'), ('Meat and fish'), ('Drinks'), ('Other');

insert into item (name, location_id, category_id, purchase_date, best_before) values
    ('Milk',           1, 1, current_date - 3,  current_date + 2),
    ('Chicken breast', 1, 4, current_date - 4,  current_date - 1),
    ('Frozen peas',    2, 2, current_date - 20, current_date + 120),
    ('Frozen berries', 2, 3, current_date - 10, current_date + 200),
    ('Pasta',          3, 6, current_date - 15, null),
    ('Orange juice',   3, 5, current_date - 5,  current_date + 30);
