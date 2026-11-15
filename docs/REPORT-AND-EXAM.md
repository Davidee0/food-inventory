# Report and exam

## The exam (CBS course page, `KAN-CDIBO2601U`)

* Individual oral exam based on the written group product: 20 minutes per student, including the grading; 7 point scale; internal and external examiner.
* Hand in on time, or you cannot take the oral exam: the written product (at most 10 pages), an optional appendix (for example code and illustrations), and a zip with all programming code and database scripts.
* The prototype: full stack, web based, smartphone compatible, with persistent data storage and several end to end working scenarios. The report also describes the path from idea to prototype, with project management and the development method.
* Graded on 8 learning objectives (below). A 12 means all of them with no or only minor errors.

Also check in the project guide, as noted in the team's earlier plan: appendix at most 5 pages, abstract at most 150 words, only your own work (no copied course definitions). Team plan: feature complete 18 November, code freeze and report draft 2 December, submission 13 December.

The zip for the hand in, from the repository folder: `git archive --format=zip -o food-inventory.zip HEAD` (code and `database.sql`, without `node_modules`, `bin` or `obj`).

## The report, objective by objective

| Learning objective | What to write | Where it is |
|---|---|---|
| 1 Build a full stack prototype (frontend, backend, Web API) | The scenarios that run end to end: add, edit, delete, Ate it with Undo, categories and storage locations | README demo script, the app |
| 2 Identify and discuss the components | Database, Model (entities, repositories), API (controllers), Angular (components, services, models) and how they talk (HTTP and JSON, dependency injection) | README structure table, [`ER-DIAGRAM.md`](ER-DIAGRAM.md) |
| 3 Strengths and limitations of the technologies | Angular (full framework, TypeScript, Material; steep learning curve, OnPush and `markForCheck()` in Angular 22), ASP.NET Core (Swagger, dependency injection; .NET 8 now out of support), PostgreSQL (constraints; schema changes touch every layer) | [`TESTING.md`](TESTING.md) "Before you run it" |
| 4 Client server architecture and its challenges | Angular on port 4200 calls the API on 5050: CORS, asynchronous data, the JSON contract (dates as `"YYYY-MM-DD"`), errors over the network | `Program.cs`, `services/` |
| 5 Reflect on design, development, implementation and testing | What you tested and found, the limitations, what you would change | [`TESTING.md`](TESTING.md) results and "Known limitations" |
| 6 Business needs and technical limitations | Household food waste, value of the app, what a real product would need (login, deployment, checks in the API) | [`BACKLOG.md`](BACKLOG.md) Product Goal |
| 7 Requirements engineering and a product mindset | Personas, user stories, acceptance criteria, what was left out and why (US12, US14), outcome over output | [`BACKLOG.md`](BACKLOG.md) |
| 8 Collaborative, iterative development and project management | Scrum backlog, pull requests reviewed by a teammate before merging, the increments lecture by lecture | [`BACKLOG.md`](BACKLOG.md) Definition of Done, the pull requests on GitHub |

Code worth explaining in the report and at the exam:
* `FoodItemRepository.GetFoodItems`: SQL with a join and `order by`, read through the course's `BaseRepository`.
* `CategoryController.DeleteCategory`: the foreign key refuses the delete, the controller answers 409 with a message.
* `ItemForm`: reactive form with `FormControl`, `Validators` and `mat-error` (Lecture 8).
* `EatList.ateOne` and `undo`: PUT with one less, or DELETE for the last one, and the snackbar's Undo.
* `FoodItemControllerTests`: a mocked repository with Moq (Lecture 9).

## On the day

Have this open and running before your slot:
1. pgAdmin connected to `food_inventory` (and its ERD, right click the database, ERD For Database).
2. The API (`DOTNET_ROLL_FORWARD=Major dotnet run --project backend/FoodInventory.API` if you only have .NET 10) and Swagger at http://localhost:5050/swagger.
3. The frontend (`ng serve`) at http://localhost:4200, in the browser's phone view.
4. VS Code with the project, ready to open any file the examiners ask about.

Then follow the README demo script. Expect questions such as: walk through what happens when you add an item, layer by layer; why the foreign key and the 409; why the form and the database both validate; what you would do differently; how the team worked.
