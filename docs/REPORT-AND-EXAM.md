# Report and exam

## The exam (CBS course page, `KAN-CDIBO2601U`, and the Project and Exam Guide)

- Individual oral exam based on the written group product: 20 minutes per student, including the grading; 7-point scale; internal and external examiner. You defend the project, demo the working app and discuss the topics of the course.
- Hand in on time, or you cannot take the oral exam: the written report (at most 10 pages), an optional appendix (at most 5 pages, for example screenshots), and a zip with all programming code and database scripts.
- The prototype: full stack, web based, smartphone compatible, with persistent data and several end-to-end scenarios. Graded on the 8 learning objectives (below); a 12 means all of them with no or only minor errors.
- Team plan: feature complete 18 November, code freeze and report draft 2 December, submission 13 December (14 December is the buffer).

The zip for the hand-in, from the repository folder: `git archive --format=zip -o food-inventory.zip HEAD` (code, `Database/` and `docs/`, without `node_modules`, `bin` or `obj`; well under the guide's 5 to 15 MB).

## The report: the guide's structure mapped to this project

| Section (Project and Exam Guide) | What to write for this project | Where to find it |
|---|---|---|
| Abstract (at most 150 words) | The problem (household food waste), the app (one shared list, soonest best before date first, expiring food marked), the stack, the result | [BACKLOG.md](BACKLOG.md) Product Goal |
| Introduction: the idea | Discover, define, develop, deliver; personas; why no login | [BACKLOG.md](BACKLOG.md) |
| Design choices: database | 3 tables, 2 foreign keys, `check` constraints, 21 example rows; why a category with food cannot be deleted; plain dates | [ARCHITECTURE.md](ARCHITECTURE.md#database-er-model), `Database/food_inventory.sql` |
| Design choices: backend | `.API` and `.Model` like CourseAdminSystem; repositories on `BaseRepository`; dependency injection; status codes (200, 204, 400, 404, 409); Swagger; CORS | [ARCHITECTURE.md](ARCHITECTURE.md#api) |
| Design choices: frontend | Components (list and card, add and edit forms, categories, storage locations), services, signals, routing, Angular Material, mobile first, snackbars; Figma wireframes and prototype | [ARCHITECTURE.md](ARCHITECTURE.md#layers), README screenshots |
| Implementation: one request end to end | Adding a food item, layer by layer | [ARCHITECTURE.md](ARCHITECTURE.md#one-request-from-click-to-database-and-back-adding-a-food-item) |
| Validation | The same rules in the form, the API and the database | [ARCHITECTURE.md](ARCHITECTURE.md#validation-in-three-layers-lecture-7) |
| Project management | Scrum backlog, roadmap with weekly checklists and milestones, roles, pull requests reviewed by a teammate, CI | [BACKLOG.md](BACKLOG.md) Definition of Done, the pull requests on GitHub |
| Testing | Unit tests (xUnit + Moq, Karma + Jasmine), CI, the manual test table with results, what we found | [TESTING.md](TESTING.md) |
| Reflection | Strengths and limitations, what we would do next (login, unique names, deployment, US14) | [ARCHITECTURE.md](ARCHITECTURE.md#strengths-and-limitations), [TESTING.md](TESTING.md#known-limitations-for-the-reflection-in-the-report) |
| At least one code snippet and why it matters | See the list below | |
| Appendix (at most 5 pages) | Screenshots of the app, Swagger and pgAdmin's ERD | `docs/screenshots/` |

Only your own work: no definitions copied from the course.

Code worth showing in the report and explaining at the exam:

- `CategoryController.DeleteCategory`: the foreign key refuses the delete, the controller answers 409 with a message, the page shows it in a snackbar.
- `FoodItemRepository.GetFoodItems`: SQL with a join and `order by`, read through the course's `BaseRepository`.
- `FoodItemCard.warning()`: "Expired" or "Eat soon" from the local date (US11), and its unit tests.
- `AddFoodItem`: reactive form with `FormControl`, `Validators` and `mat-error` (Lecture 8); `EditFoodItem`: template form with `[(ngModel)]` and `#name="ngModel"` (Lecture 7).
- `FoodItemControllerTests`: a mocked repository with Moq (Lecture 9).

## The 8 learning objectives

| Learning objective | What to show | Where it is |
|---|---|---|
| 1 Build a full-stack prototype (frontend, backend, Web API) | Add, edit, Ate one, delete, filter, categories and storage locations, end to end | The app, the demo script below |
| 2 Identify and discuss the components | Database, Model (entities, repositories), API (controllers), Angular (components, services, models) and how they talk (HTTP and JSON, dependency injection) | [ARCHITECTURE.md](ARCHITECTURE.md), README structure |
| 3 Strengths and limitations of the technologies | Angular (full framework, TypeScript, Material; learning curve), ASP.NET Core (Swagger, dependency injection, model validation), PostgreSQL (constraints; a schema change touches every layer) | [ARCHITECTURE.md](ARCHITECTURE.md#strengths-and-limitations) |
| 4 Client-server architecture and its challenges | Angular on port 4200 calls the API on 5050: CORS, asynchronous data (Observables), the JSON contract (dates as `"YYYY-MM-DD"`), errors over the network | `Program.cs`, `services/`, `http-common.ts` |
| 5 Reflect on design, development, implementation and testing | What we tested and found, the limitations, what we would change | [TESTING.md](TESTING.md) |
| 6 Business needs and technical limitations | Household food waste, the value of the app, what a real product needs (login, deployment, GDPR) | [ARCHITECTURE.md](ARCHITECTURE.md#business-value-lecture-1) |
| 7 Requirements engineering and a product mindset | Personas, user stories, acceptance criteria, what was left out and why (login, US14), outcome over output | [BACKLOG.md](BACKLOG.md) |
| 8 Collaborative, iterative development and project management | Scrum backlog, roadmap, pull requests reviewed by a teammate, CI, the increments lecture by lecture | [BACKLOG.md](BACKLOG.md), GitHub |

## Exam-day checklist

Be on site at least one hour before your slot. Have this open and running before you go in (your own laptop or a teammate's):

1. A fresh database from `psql -h localhost -U postgres -f Database/setup.sql` on the same day (the example dates are counted from that day, so "Expired" and "Eat soon" show). pgAdmin connected to `food_inventory`, with its ERD (right click the database, *ERD For Database*).
2. The API: `dotnet run --project FoodInventory.API` in `Backend/`, and Swagger at http://localhost:5050/swagger.
3. The frontend: `ng serve` in `Frontend/FoodInventory.NG/`, http://localhost:4200 in the browser's phone view (360 px).
4. VS Code with the project, ready to open any file the examiners ask about.
5. Internet for the Material icons and the font (without it the icons show as words; the app still works).

Demo script (about 3 minutes):

1. The list: soonest best before date first, "Expired" and "Eat soon" with the warning icon.
2. Filter by Dairy and Fridge ("Showing 3 of 12 items"), then Clear filters.
3. Add food: show the messages with an empty form, then add a valid item (snackbar "... added").
4. Edit it: "Error in data" with an empty name, then Update (snackbar "... saved").
5. "Ate one", then Delete with the question.
6. Categories: try to delete Dairy (red snackbar with the 409 message); show the same answer in Swagger and the foreign key in pgAdmin.

Answer only what is asked. Expect questions such as: walk through what happens when you add an item, layer by layer; why the foreign key and the 409; why the form, the API and the database all validate; what a signal is; how the tests mock the repository; what you would do differently; how the team worked. More, with short answers: [ARCHITECTURE.md](ARCHITECTURE.md#likely-oral-exam-questions).
