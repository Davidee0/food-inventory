-- Food inventory: 3 tables and example rows (Lecture 3).
-- Run it on the database food_inventory (pgAdmin Query Tool, or through setup.sql).
-- It is safe to run again: tables are only created when missing, rows are only inserted into empty tables.

create table if not exists storage_location
	(id			serial,
	 name			varchar(30) not null check (name <> ''),
	 primary key (id)
	);

create table if not exists category
	(id			serial,
	 name			varchar(30) not null check (name <> ''),
	 primary key (id)
	);

-- The two foreign keys have no "on delete": a category or storage location
-- that still has food in it cannot be deleted (the API answers 409).
create table if not exists food_item
	(id			serial,
	 name			varchar(50) not null check (name <> ''),
	 quantity		integer not null check (quantity > 0),
	 purchase_date		date not null,
	 best_before_date	date,
	 category_id		integer,
	 storage_location_id	integer not null,
	 primary key (id),
	 foreign key (category_id) references category (id),
	 foreign key (storage_location_id) references storage_location (id),
	 check (best_before_date >= purchase_date)
	);

-- Example rows: 3 storage locations, 6 categories, 12 food items.

insert into storage_location (name)
select name
from (values ('Fridge'), ('Freezer'), ('Pantry')) as example (name)
where not exists (select 1 from storage_location);

insert into category (name)
select name
from (values ('Dairy'), ('Vegetables'), ('Fruit'), ('Meat and fish'), ('Drinks'), ('Other')) as example (name)
where not exists (select 1 from category);

-- The dates are counted from today, so the list always has food that is expired, expires soon and is fine.
-- The joins look up the ids of the category and the storage location by name.
insert into food_item (name, quantity, purchase_date, best_before_date, category_id, storage_location_id)
select example.name, example.quantity, current_date - example.days_ago, current_date + example.days_left,
       category.id, storage_location.id
from (values
	('Chicken breast',	2,  4,   -1, 'Meat and fish',	'Fridge'),
	('Milk',		1,  3,    1, 'Dairy',		'Fridge'),
	('Yogurt',		4,  5,    3, 'Dairy',		'Fridge'),
	('Carrots',		6,  2,    9, 'Vegetables',	'Fridge'),
	('Cheese',		1,  6,   20, 'Dairy',		'Fridge'),
	('Apples',		5,  1,   14, 'Fruit',		'Pantry'),
	('Orange juice',	2,  5,   30, 'Drinks',		'Pantry'),
	('Frozen peas',		1, 20,  120, 'Vegetables',	'Freezer'),
	('Frozen berries',	2, 10,  200, 'Fruit',		'Freezer'),
	('Salmon fillet',	2,  7,   90, 'Meat and fish',	'Freezer'),
	('Pasta',		3, 15, null, 'Other',		'Pantry'),
	('Rice',		1, 30, null, null,		'Pantry')
     ) as example (name, quantity, days_ago, days_left, category, storage_location)
     left join category on category.name = example.category
     join storage_location on storage_location.name = example.storage_location
where not exists (select 1 from food_item);
