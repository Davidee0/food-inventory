# Product backlog

Scrum (Lectures 1 and 2): the Product Owner orders this backlog, and a story is done when its acceptance criteria and the Definition of Done below are met.

## Product Goal

A shared food inventory that helps a household eat its food before it goes off.

How we got there (Lecture 2: discover, define, develop, deliver):
* **Discover:** people forget what is in the fridge, freezer and pantry, buy things twice and throw food away after its best before date. Households waste the most food: 60% of the 1.05 billion tonnes wasted in 2022 (UNEP Food Waste Index Report 2024).
* **Define:** a household loses track of the food it has and of when it goes off, so food is wasted.
* **Develop:** options were a shared list sorted by best before date, reminders, barcode scanning and recipes for food that goes off soon.
* **Deliver:** the smallest useful product: one shared list, soonest best before date first, expiring food marked, with quantities, categories and storage locations.

Ethics (Lecture 2): no accounts and no personal data, only the food list. Every SQL statement uses parameters (`@name`), so typed text can never change the SQL, and Angular escapes everything shown with `{{ }}`.

## Personas

* **Student** (low budget): wants to save money and avoid throwing food away.
* **Parent** (high budget): wants to reduce food waste and its impact on the environment.
* **Flatmate:** shares a fridge and supplies with others and needs a quick overview.

## User stories

| ID | Story | Status |
|---|---|---|
| US1 | As a student, I want to add a food item, so that I know what I have at home and do not buy it twice. | Done |
| US2 | As a parent, I want to see all my food in one list, so that I get an overview of my stock at a glance. | Done |
| US3 | As a student, I want to edit a food item (for example a wrong date), so that the list always matches reality. | Done |
| US4 | As a parent, I want to delete a food item once it is used up, so that the list only shows what I have. | Done |
| US5 | As a user, I want clear messages when I enter wrong data, so that I can correct mistakes right away. | Done |
| US6 | As a student, I want to use the app on my phone, so that I can check my stock in the supermarket. | Done |
| US7 | As a user, I want to give each food item a category, so that my food is organised by type. | Done |
| US8 | As a user, I want to add, rename and delete categories, so that I can organise my food my way. | Done |
| US9 | As a flatmate, I want to record how many I have and eat them one at a time, so that the list shows what is left. | Done |
| US10 | As a flatmate, I want to filter by category and storage location, so that I find things quickly. | Done |
| US11 | As a parent, I want expired and soon expiring food marked, so that I eat it first. | Done |
| US12 | As a user, I want to show the newest food first, so that I see what I bought last. | Not built (optional) |
| US13 | As a user, I want to add, rename and delete storage locations, so that they match my home. | Done |

## Acceptance criteria

* **US1 Add food:** name (required, at most 50 characters), quantity (a whole number of at least 1, starts at 1), storage location (required), category (optional), purchase date (required, starts at today), best before date (optional, not before the purchase date). Add stays disabled while something is wrong; after adding, the food list opens and shows the new food.
* **US2 Food list:** each card shows name, quantity, category, storage location, purchase date and best before date. Soonest best before date first, food without one last, ties by name. No food: "No food found."
* **US3 Edit:** the page opens with the current values and checks the same rules as Add; Update saves the whole food item and goes back to the list.
* **US4 Delete:** `confirm()` asks "Delete Milk?"; Cancel keeps it.
* **US5 Validation:** a message at each wrong field; Add is disabled and Update is replaced by "Error in data" while something is wrong. The API answers 400 for a missing name, a quantity below 1 or a best before date before the purchase date, and the database refuses them too.
* **US6 Mobile:** every page works at 360 px wide without sideways scrolling.
* **US7 Category:** chosen from a drop down that starts with "No category"; shown on the card.
* **US8 Categories:** add, rename and delete in one table; a name is required and has at most 30 characters. A category that still has food cannot be deleted: "Dairy still has food in it, so it cannot be deleted."
* **US9 Quantity:** "Ate one" lowers it by 1 once the API has saved it; eating the last one asks to delete the food.
* **US10 Filters:** Category and Storage location work together; All shows everything; nothing matching: "No food found."
* **US11 Expiring food:** "⚠ Expired" after the best before date, "⚠ Expires soon" from 3 days before it; a text and an icon, not colour alone.
* **US13 Storage locations:** as US8: "Fridge still has food in it, so it cannot be deleted."

## Definition of Done

* The acceptance criteria work in the browser, also at 360 px wide.
* CI is green: the backend builds and the API answers on a database made from `database.sql`; the frontend passes Prettier, `ng build` and `ng test`.
* README.md maps the change to its lecture, or lists it under "What the app adds to the lectures".
* Merged through a pull request that a teammate has read.
