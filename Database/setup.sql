-- Safe to run again: nothing is created or inserted twice.

-- "create database" has no "if not exists": the select writes it only when missing, \gexec runs it.
select 'create database food_inventory'
where not exists (select 1 from pg_database where datname = 'food_inventory')\gexec

-- \ir finds food_inventory.sql next to this file, wherever psql was started.
\c food_inventory
\ir food_inventory.sql
