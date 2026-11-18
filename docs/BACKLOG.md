# Product backlog

Scrum (Lectures 1 and 2): the Product Owner orders this backlog, the team takes stories into a sprint, and a story is done when its acceptance criteria and the [Definition of Done](#definition-of-done) are met. The story numbers are the ones in the team's requirements document (Phase 1, Phase 2, Later). The acceptance criteria describe what the app does today.

## Product Goal

A shared food inventory that helps a household eat its food before it goes off.

How we got there (Lecture 2: discover, define, develop, deliver):

- **Discover:** people forget what is in the fridge, freezer and pantry, buy things twice and throw food away after its best before date. Households waste the most food: 60% of the 1.05 billion tonnes wasted in 2022 (UNEP Food Waste Index Report 2024).
- **Define:** a household loses track of the food it has and of when it goes off, so food is wasted.
- **Develop:** options were a shared list sorted by best before date, reminders, barcode scanning and recipes for food that goes off soon.
- **Deliver:** the smallest useful product: one shared list, soonest best before date first, expiring food marked, with quantities, categories and storage locations, and "Ate one" to keep the list current.

Ethics (Lecture 2): no accounts and no personal data, only the food list. Every SQL statement uses parameters (`@name`), so typed text can never change the SQL, and Angular escapes everything shown with `{{ }}`. The app works on a phone with large buttons and readable text.

Scope (team roadmap): CRUD for FoodItem and Category is required, StorageLocation follows the same pattern. Login and multi-user features are optional and are not planned.

## Personas

- **Student** (low budget): wants to save money and avoid throwing food away.
- **Parent** (high budget): wants to reduce food waste and its impact on the environment.
- **Flatmate:** shares a fridge and supplies with others and needs a quick overview.

## User stories

| ID | Story | Phase | Status |
|---|---|---|---|
| US1 | As a student, I want to add a food item with name, quantity, purchase date, category and storage location, so that I know what I have at home and do not buy it twice. | 1 | Done |
| US2 | As a parent, I want to see all my food in one list with category, storage location and dates, so that I get an overview of my stock at a glance. | 1 | Done |
| US3 | As a student, I want to edit a food item, so that my inventory always matches reality. | 1 | Done |
| US4 | As a parent, I want to delete a food item once it is used up, after a question, so that the list only shows what I have and I never delete the wrong one. | 1 | Done |
| US5 | As a user, I want clear messages when I enter wrong data, so that I can correct mistakes right away. | 1 | Done |
| US6 | As a student, I want to use the app on my phone, so that I can check my stock in the supermarket or in front of the fridge. | 1 | Done |
| US7 | As a student, I want to record how many of an item I have and eat them one at a time, so that the list shows what is left. | 2 | Done |
| US8 | As a parent, I want to choose a category for each food item from a drop-down, so that items are grouped the same way. | 2 | Done |
| US9 | As a user, I want to add, rename and delete categories, so that I can organise my food my way. | 2 | Done |
| US10 | As a flatmate, I want to filter the list by category and storage location, so that I find what I need without scrolling. | 2 | Done |
| US11 | As a parent, I want food that has gone off or goes off soon to be marked, so that I eat it first and throw away less. | Later | Done |
| US12 | As a student, I want the list sorted by best before date, so that I see which food to eat first. | Later | Done |
| US13 | As a user, I want to add, rename and delete storage locations (for example balcony, cellar), so that the app matches my home. | Later | Done |
| US14 | As a parent, I want a history of what we ate and threw away, so that we see how much we waste. | Extra | Not built, open pull request #6 |

## Acceptance criteria

- **US1 Add** (menu "Add food" or the "Add food" button in the toolbar, `/add-food-item`): name required (a name of only spaces is refused) and at most 50 characters; quantity a whole number of at least 1, starts at 1; storage location required, chosen from a list; category optional ("No category"); purchase date required, starts at today (the user's local date); best before date optional, not before the purchase date. Add stays disabled while the form is wrong. After adding, the snackbar says "Bread added" and the list opens with the new item in its place.
- **US2 View** (`/food-items`, the start page): each card shows the name, "category · storage location" ("No category" when there is none), the quantity, "Bought: <date>" and "Best before: <date>" (only when set). While the API answers the page says "Loading..."; with no food: "You have no food yet. Add your first item." with a link to the form; when the API cannot be reached: "Could not load your food. Check that the API is running." An unknown address (a typo, an old link) opens the list.
- **US3 Edit** (Edit on a card, `/edit-food-item/:id`): the form opens with the current values and the same rules as US1. While a field is wrong, "Error in data" is shown instead of the Update button. Update stores the whole item, the snackbar says "<name> saved" and the list opens again.
- **US4 Delete:** Delete on a card asks "Delete Milk?"; Cancel keeps it; OK removes it, the snackbar says "Milk deleted" and the list loads again.
- **US5 Validation:** a message under each wrong field: "Name is required", "Name can be at most 50 characters", "Quantity must be a whole number, at least 1", "Storage location is required", "Purchase date is required", "Best before date cannot be before the purchase date". Nothing is sent while the form is wrong. The API checks the same rules and answers 400 with a message ("Name is required", "Quantity must be at least 1", "Storage location is required", "Purchase date is required", "Best before date cannot be before the purchase date"), and the database refuses the same mistakes with `not null`, `check` and foreign keys (Lecture 7: validation in layers).
- **US6 Mobile:** one column of at most 430 px; at 360 px wide no sideways scrolling on any page; text 16 px; buttons and fields at least 44 px high; the toolbar with the menu and "Add food" stays at the top.
- **US7 Quantity:** the quantity is entered in the form and shown on the card. "Ate one" lowers it by 1 (PUT with the whole item) and the snackbar says "Ate one Pasta"; on the last one the app asks "Delete Pasta?" and deletes it.
- **US8 Category drop-down:** the category comes from a drop-down that starts with "No category"; six example categories come with the database; the category is shown on the card.
- **US9 Categories** (menu "Categories", `/categories`): add, rename (Save) and delete after a question; an empty name cannot be saved or added. A category that still has food cannot be deleted: the red snackbar shows the API's message "Dairy still has food in it, so it cannot be deleted."
- **US10 Filter:** two drop-downs on the list, by category and by storage location, which can be combined; "Clear filters" shows everything again. The line "Showing 3 of 12 items, soonest best before date first." says how many match; when nothing matches: "No food matches these filters."
- **US11 Expiring food:** "Expired" when the best before date is before today, "Eat soon" from today up to 3 days ahead, each with a warning icon and text, not colour alone. Food without a best before date is never marked.
- **US12 Sort:** the list is sorted by the database: soonest best before date first, food without a date last, ties by name.
- **US13 Storage locations** (menu "Storage locations", `/storage-locations`): as US9: "Fridge still has food in it, so it cannot be deleted."
- **US14 History** (pull request #6, not on `main`): a fourth table `food_log`, "Threw one away" next to "Ate one", and a History page with "Eaten: 16, thrown away: 6, so 27% was wasted." The pull request targets an old branch and the old folder layout, so it needs to be redone on the current `main` if the team wants it.

## Definition of Done

- The acceptance criteria work in the browser, also at 360 px wide (see the manual tests in [TESTING.md](TESTING.md)).
- `dotnet test` in `Backend/` and `ng test --watch=false` in `Frontend/FoodInventory.NG/` pass; `dotnet build` has no warnings; `ng build` has no errors.
- The checks of `.github/workflows/tests.yml` are green on the pull request: the tests, `Database/setup.sql` on PostgreSQL 16, the API's answers, the build.
- The rules and messages are the same in the form, in the entities of the API and in the database (Lecture 7).
- README.md and the documents in `docs/` are updated when the structure or the behaviour changes; the Figma file when the layout changes.
- Merged through a pull request that a teammate has read.
