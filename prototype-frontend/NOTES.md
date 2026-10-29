# Notes
Done: gates 0 to 4. Items and categories with full CRUD, filters, quantity buttons, "Eat soon" and "Past best before" labels. About 430 lines of code. Not done: deployment.
Run: Node 22.13 or newer (the database is built in; a harmless "experimental" warning is normal). npm install, npm run reset, npm start, open http://localhost:3000.
Phone: check the layout in Chrome DevTools (device toolbar, 360 px), then on your own phone: http://<your computer's address>:3000 on the same wifi (some university wifi blocks this).
Check: node scripts/check.js (64 API checks, it resets the data itself). Run npm run reset before the demo to bring the 6 examples back.
Decisions, and why:
- items.category_id is a foreign key and PRAGMA foreign_keys = ON is set: the database itself refuses to delete a used category. The API counts first only to say how many items use it.
- Dates are YYYY-MM-DD text. Today comes from the Europe/Copenhagen calendar, and days are added in UTC (no daylight saving).
- The server works out each item's status (soon or past), so the date rules live in one file: dates.js.
- Names are trimmed. Category names are compared in lower case in code, because SQLite NOCASE only knows A to Z.
- Typed text goes into the page with textContent, never innerHTML.
- After every change the page asks the server for everything again and redraws, so the screen is built in one place.
Next, deploy on Render (free): push to GitHub, New > Web Service, Language Node, Build Command npm install, Start Command npm start (default Node is 24, which works). The free plan sleeps after 15 idle minutes (the next request takes up to a minute) and its disk is temporary, so the data goes back to the 6 examples after every sleep or deploy. Open the link a few minutes before the demo.
