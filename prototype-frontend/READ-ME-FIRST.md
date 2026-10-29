# Reference solution: read this first
A finished, tested Food Inventory App, kept short (about 430 lines of code) so you can explain every line.
1. Let Claude build each gate in your own project. Run node scripts/check.js N until it passes, and explain the step back before you move on.
2. Use this app to compare. Where yours differs, ask "why", not "which is right".

Reading order
- dates.js (14 lines): dates as text, today in Copenhagen, adding days, the Eat soon and Past rule
- db.js (34): the tables, the foreign key, the example data, the reset
- server.js (116): the rules for an item and a category name, then one route per verb and path, each ending in 201, 204, 400, 404 or 409
- public/app.js (211) with index.html: load everything, redraw, the form with the same rules, the filters
- scripts/check.js is the contract. node scripts/fk-proof.js shows the database refusing to delete a used category.

Break it on purpose: predict what fails, then run node scripts/check.js.
- In server.js, remove .trim() from nameOf.
- In server.js, change c.item_count > 0 to c.item_count > 9999. The database still refuses, so the answer is 500 instead of 409.
- In dates.js, change the 3 in statusOf to 2.
- In db.js, switch the PRAGMA to OFF. node scripts/check.js still passes, because the API counts items before it deletes. Only node scripts/fk-proof.js fails.
