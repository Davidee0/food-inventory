# Product backlog

Scrum (Lectures 1 and 2): the Product Owner orders this backlog, and a story is done when its acceptance criteria and the Definition of Done below are met. The story numbers are the ones in the team's requirements document. The acceptance criteria describe what the app on `main` does today.

## Product Goal

A shared food inventory that helps a household eat its food before it goes off.

How we got there (Lecture 2: discover, define, develop, deliver):
* **Discover:** people forget what is in the fridge, freezer and pantry, buy things twice and throw food away after its best before date. Households waste the most food: 60% of the 1.05 billion tonnes wasted in 2022 (UNEP Food Waste Index Report 2024).
* **Define:** a household loses track of the food it has and of when it goes off, so food is wasted.
* **Develop:** options were a shared list sorted by best before date, reminders, barcode scanning and recipes for food that goes off soon.
* **Deliver:** the smallest useful product: one shared list, soonest best before date first, expiring food marked, with quantities, categories and storage locations, and "Ate it" to keep the list current.

Ethics (Lecture 2): no accounts and no personal data, only the food list. Every SQL statement uses parameters (`@name`), so typed text can never change the SQL, and Angular escapes everything shown with `{{ }}`.

## Personas

* **Student** (low budget): wants to save money and avoid throwing food away.
* **Parent** (high budget): wants to reduce food waste and its impact on the environment.
* **Flatmate:** shares a fridge and supplies with others and needs a quick overview.

## User stories

| ID | Story | Status on `main` |
|---|---|---|
| US1 | As a student, I want to add a food item, so that I know what I have at home and do not buy it twice. | Done |
| US2 | As a parent, I want to see all my food in one list, so that I get an overview of my stock at a glance. | Done |
| US3 | As a student, I want to edit a food item, so that the list always matches reality. | Done |
| US4 | As a parent, I want to delete a food item once it is used up, so that the list only shows what I have. | Done |
| US5 | As a user, I want clear messages when I enter wrong data, so that I can correct mistakes right away. | Done |
| US6 | As a student, I want to use the app on my phone, so that I can check my stock in the supermarket. | Done |
| US7 | As a parent, I want to put each food item in a category, so that I see what kind of food I have. | Done |
| US8 | As a user, I want to add, rename and delete categories, so that I can organise my food my way. | Done |
| US9 | As a student, I want to record how many I have and eat them one at a time, so that the list shows what is left. | Done |
| US10 | As a flatmate, I want to find food by category and storage location, so that I find things without scrolling. | Done, as one search field |
| US11 | As a parent, I want expired and soon expiring food marked, so that I eat it first. | Done |
| US12 | As a user, I want to sort the list another way (optional in the requirements document). | Not built |
| US13 | As a user, I want to add, rename and delete storage locations, so that they match my home. | Done |
| US14 | As a user, I want a history of what I ate and threw away, so that I see how much I waste. | Not on `main`: open pull request #6 |

## Acceptance criteria

* **US1 Add (`/add`):** name (required, at most 50 characters), quantity (at least 1, starts at 1), storage location (required, from a list), category (optional, "No category"), purchase date (required, starts at today), best before date (optional). Save stays disabled while a required field is missing. After saving, a message "Bread saved" and the inventory opens with the new item.
* **US2 Inventory (`/items`):** each card shows name, category, storage location, quantity, purchase date and best before date (if set). Soonest best before date first, food without one last, ties by name. "Showing 6 of 6 items"; nothing to show: "No food found". If the API cannot be reached: the message "Could not load the food items".
* **US3 Edit (`/edit/:id`):** Edit on a card opens the same form with the current values and the same rules; Save stores the whole item and goes back to the inventory.
* **US4 Delete:** Delete on a card asks "Delete Milk?"; Cancel keeps it, OK removes it and shows "Milk deleted".
* **US5 Validation:** a message under each wrong field ("Item name is required", "Item name can be at most 50 characters", "Quantity must be at least 1", "Storage location is required", "Purchase date is required"), and Save is disabled. A best before date before the purchase date gives "Best before date cannot be before the purchase date" and nothing is sent. The database refuses the same mistakes (Lecture 7: validation in layers).
* **US6 Mobile:** one column of at most 430 px, a tab bar at the bottom (Add, Inventory, Ate it), no sideways scrolling at 360 px.
* **US7 Category:** chosen from a drop down that starts with "No category"; shown on the card.
* **US8 Categories (gear, `/settings`):** add, rename (save icon) and delete; an empty name cannot be saved. A category that still has food cannot be deleted: "Dairy still has food in it, so it cannot be deleted."
* **US9 Quantity and Ate it (`/eat`):** "Ate it" lowers the quantity by 1 ("1 Pasta eaten"); the last one removes the item. Undo in the message puts it back.
* **US10 Find:** one search field on the inventory matches the food name, the category and the storage location ("pantry" shows everything in the pantry).
* **US11 Expiring food:** "Expired" after the best before date and "Expires soon" within 3 days, as text and a warning icon, not colour alone.
* **US13 Storage locations:** as US8, on the same page: "Fridge still has food in it, so it cannot be deleted."

## Definition of Done

* The acceptance criteria work in the browser, also at 360 px wide.
* The checks on the pull request are green: `dotnet test`, the API against a database made from `database.sql`, `ng build` and `ng test`.
* README.md is up to date.
* Merged through a pull request that a teammate has read.
