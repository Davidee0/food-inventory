-- Food inventory: the whole database with one command (run it from the project folder):
--
--     psql -h localhost -U postgres -f Database/setup.sql
--
-- It is safe to run again: nothing is created or inserted twice.
-- Without psql: create the database food_inventory in pgAdmin and run food_inventory.sql in its Query Tool.

-- "create database" has no "if not exists". This select writes the command only when
-- the database is missing, and \gexec runs what the select wrote.
select 'create database food_inventory'
where not exists (select 1 from pg_database where datname = 'food_inventory')\gexec

-- Connect to the database and run the script that is in the same folder as this one.
\c food_inventory
\ir food_inventory.sql
