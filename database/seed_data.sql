-- Seed data. Run ONCE on a brand-new database right after create_tables.sql.
-- The app never seeds by itself, so deleting all items never brings them back.
INSERT INTO locations (name) VALUES ('Fridge'), ('Freezer'), ('Pantry');

INSERT INTO categories (name, name_key) VALUES
    ('Dairy', 'dairy'),
    ('Vegetables', 'vegetables'),
    ('Fruit', 'fruit'),
    ('Meat and fish', 'meat and fish'),
    ('Drinks', 'drinks'),
    ('Other', 'other');

INSERT INTO items (name, location_id, category_id, purchase_date, best_before)
SELECT v.name,
       (SELECT id FROM locations  WHERE name = v.loc),
       (SELECT id FROM categories WHERE name = v.cat),
       CURRENT_DATE - v.bought,
       CASE WHEN v.bb IS NULL THEN NULL ELSE CURRENT_DATE + v.bb END
FROM (VALUES
    ('Milk',           'Fridge',  'Dairy',         3,   2),
    ('Chicken breast', 'Fridge',  'Meat and fish', 4,  -1),
    ('Frozen peas',    'Freezer', 'Vegetables',   20, 120),
    ('Frozen berries', 'Freezer', 'Fruit',        10, 200),
    ('Pasta',          'Pantry',  'Other',        15, NULL),
    ('Orange juice',   'Pantry',  'Drinks',        5,  30)
) AS v(name, loc, cat, bought, bb);
