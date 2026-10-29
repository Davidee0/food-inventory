-- Example data: 3 locations, 6 categories, 6 items. Run once, right after create_tables.sql.
-- It is one transaction. On a database that already has data the first insert fails (location
-- names are unique), so nothing is added twice and deleted items never come back.
BEGIN;

INSERT INTO locations (name) VALUES ('Fridge'), ('Freezer'), ('Pantry');

INSERT INTO categories (name, name_key) VALUES
    ('Dairy', 'dairy'),
    ('Vegetables', 'vegetables'),
    ('Fruit', 'fruit'),
    ('Meat and fish', 'meat and fish'),
    ('Drinks', 'drinks'),
    ('Other', 'other');

-- Bought N days ago, best before in N days (NULL: no best before date).
INSERT INTO items (name, location_id, category_id, purchase_date, best_before)
SELECT v.name,
       (SELECT id FROM locations WHERE name = v.location),
       (SELECT id FROM categories WHERE name = v.category),
       CURRENT_DATE - v.bought,
       CURRENT_DATE + v.until
FROM (VALUES
    ('Milk',           'Fridge',  'Dairy',          3,    2),
    ('Chicken breast', 'Fridge',  'Meat and fish',  4,   -1),
    ('Frozen peas',    'Freezer', 'Vegetables',    20,  120),
    ('Frozen berries', 'Freezer', 'Fruit',         10,  200),
    ('Pasta',          'Pantry',  'Other',         15, NULL),
    ('Orange juice',   'Pantry',  'Drinks',         5,   30)
) AS v(name, location, category, bought, until);

COMMIT;
