# Product backlog

Scrum (lectures 1 and 2): the Product Owner orders this backlog, the team takes stories into a sprint, and a story is done when it meets
its acceptance criteria and the Definition of Done below.

## Product Goal

A shared food inventory that helps a household eat its food before it goes off.

How we got there (lecture 2: discover, define, develop, deliver):
- **Discover:** people forget what is in the fridge, freezer and pantry, buy things twice and throw food away after its best before date.
  In 2022 households wasted 60% of the 1.05 billion tonnes of food wasted worldwide (UNEP Food Waste Index Report 2024).
- **Define:** a household loses track of the food it has and of when it goes off, so food is wasted.
- **Develop:** options were a shared list sorted by best before date, reminders, barcode scanning and recipes for food that goes off soon.
- **Deliver:** the smallest useful product: one shared list, soonest best before date first, with storage locations and categories (US1-US8).

Ethics (lecture 2): the app has no accounts and stores no personal data, only the food list; it works on phones with large buttons and readable text.

## User stories

| ID | Story | Status |
|---|---|---|
| US1 | As a household member, I want to add an item with its storage location, category and dates, so that I know what food we have. | Done |
| US2 | As a household member, I want to see the items with the soonest best before date first, so that food is eaten before it goes off. | Done |
| US3 | As a household member, I want to edit an item, so that I can correct it. | Done |
| US4 | As a household member, I want to delete an item after a question that names it, so that I never delete the wrong one. | Done |
| US5 | As a household member, I want a clear message under each wrong field, so that I know what to fix. | Done |
| US6 | As a phone user, I want big buttons, readable text and no sideways scrolling, so that I can use the app in the kitchen. | Done |
| US7 | As a household member, I want to choose a category from a list, so that items are grouped the same way. | Done |
| US8 | As a household member, I want to add, rename and delete categories, so that they fit my household. | Done |
| US9 | As a household member, I want to record how many of an item I have, so that I know when to buy more. | Not built (optional) |
| US10 | As a household member, I want to filter the list by location or category, so that I find things quickly. | Not built (optional) |
| US11 | As a household member, I want to see which items have gone off or go off soon, so that I use them first. | Not built (optional) |
| US12 | As a household member, I want to sort by name or by best before date, so that I find items the way I need. | Not built (optional) |
| US13 | As a household member, I want to add and rename storage locations, so that they fit my home. | Not built (optional) |

## Acceptance criteria (US1-US8)

- **US1 Add:** Name 1-50 characters (trimmed), storage location required, category optional, purchase date (today by default, the
  user's local date), best before date optional and not before the purchase date. The new item appears in the list in the right place,
  and a message says "Saved <name>." (also after an edit).
- **US2 List:** soonest best before date first, items without a date last, ties by name ignoring case. Each item shows its name,
  "location, category", "Bought <date>" and "Best before <date>" (only if it has one). No items: "Nothing here yet." with
  "Add your first item". Loading fails: "Could not load your items." (or the connection message) with "Try again".
- **US3 Edit:** the form opens with the current values; saving replaces the whole item; an item that no longer exists gives "Item not found.".
- **US4 Delete:** the question "Delete <name>?"; Cancel keeps the item; after deleting, a message says "Deleted <name>.".
- **US5 Validation:** one message under each wrong field ("Enter a name.", "Choose a storage location.", "Enter a valid date." ...),
  nothing is sent while the form is wrong, and the API checks the same rules with the same messages.
- **US6 Mobile:** works at 360 px wide without sideways scrolling; buttons and fields at least 44 px; text at least 16 px;
  "Add item" always visible; Edit and Delete one tap on each item.
- **US7 Categories in the form:** the category comes from a list with "No category"; an unknown category gives "Choose a category from the list.".
- **US8 Categories:** add, rename and delete; names have 1-30 characters and are unique ignoring case ("Dairy already exists.");
  a category that items use cannot be deleted ("Dairy is used by 1 item and cannot be deleted.").

## Definition of Done

- The acceptance criteria pass, checked in the browser at 360 px.
- `dotnet test` (Backend) and `ng test` (Frontend/FoodInventory.NG) pass; `ng build` has no errors; Prettier has formatted the code.
- `Rules.cs` and `rules.ts` have the same rules and messages.
- `dotnet format` and Prettier have formatted the code; `npm audit` and `dotnet list package --vulnerable` find nothing.
- README, CLAUDE.md and the Figma file are updated when the structure or the layout changes.
- The change is merged through a pull request that a teammate has read.
