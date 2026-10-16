# Automation Testing Assessment

UI automation for **https://www.saucedemo.com** with **Playwright + JavaScript**, and API automation for **https://reqres.in/api** with **Postman**. The Postman collection runs from the command line with **Newman**.

## Project structure

```
.
├── pages/                         # Page Object Model
│   ├── LoginPage.js
│   ├── MenuComponent.js           # hamburger menu: Reset App State, Logout
│   ├── InventoryPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── tests/
│   ├── test-data.js               # users, password, customer info, messages
│   └── ui/
│       ├── q1-locked-out-user.spec.js
│       ├── q2-standard-user-checkout.spec.js
│       └── q3-performance-glitch-user.spec.js
├── api/
│   ├── collection/Reqres_API_Assessment.postman_collection.json
│   └── environment/Reqres.postman_environment.json
├── playwright.config.js           # HTML + Allure reporters, sequential run
└── package.json                   # all run scripts
```

## Prerequisites

- **Node.js 18+** (https://nodejs.org)
- **Java 8+**. You only need this to view the **Allure** report (`allure-commandline` needs Java).

## Setup

```bash
git clone <this-repo-url>
cd <repo-folder>
npm install
npx playwright install chromium
```

## Running the UI tests

| Command | What it runs |
|---|---|
| `npm run test:q1` | Q1 only: locked_out_user error message |
| `npm run test:q2` | Q2 only: standard_user, 3 items, checkout, order |
| `npm run test:q3` | Q3 only: performance_glitch_user, Z→A filter, checkout |
| `npm run test:ui` | **All three scenarios, sequentially** (1 worker) |
| `npm run test:ui:headed` | All three, with the browser visible |

### UI reports (created after every run)

- **Playwright HTML report**: `reports/playwright-html/index.html`. Open it with `npm run report:html`.
- **Allure report**: results go to `allure-results/`. Build and open it with `npm run report:allure`.
- Screenshots, videos and traces are kept for failed tests in `test-results/`.

## Running the API tests (Postman / Newman)

```bash
npm run test:api
```

The HTML report is written to `reports/api/api-report.html` (newman-reporter-htmlextra).

To run without npm scripts:

```bash
npx newman run api/collection/Reqres_API_Assessment.postman_collection.json \
  -e api/environment/Reqres.postman_environment.json \
  -r cli,htmlextra --reporter-htmlextra-export reports/api/api-report.html
```

You can also import both JSON files into the Postman app and click **Run collection**.

### API key

reqres.in may require an `x-api-key` header. The environment variable `apiKey` holds it. The default is `reqres-free-v1`. If you get **401 Unauthorized**, create a free key at https://app.reqres.in and put it in `apiKey`. If the API no longer needs a key, leave `apiKey` empty and the header is not sent.

### API test flow

Every request checks its **response code**.

| # | Request | Checks |
|---|---|---|
| Setup | `POST /register` | 200; stores `userId` |
| Q3 | `POST /login` with registered credentials | 200; captures and stores `authToken` |
| Q4 | `GET /users/{userId}` | 200; id, email, first and last name match |
| Q5 | `PUT /users/{userId}` | 200; name and job echoed; `updatedAt` is valid ISO-8601 and recent |
| Q6 | `PATCH /users/{userId}` (only `job`) | 200; job changed; only `job` (+`updatedAt`) in response; name untouched |
| Q8 | 7 bad requests built from stored data | every response is 4xx (400 / 401 / 404) with error checks |

Q8 bad requests: login without a password, login with an empty body, login with an unregistered email, register without a password, register without an email, GET with a non-existent user id (stored id + 1000), and GET of an unknown resource.

> reqres.in is a mock API, so PUT and PATCH return the request body plus `updatedAt` and do not save anything. Q6 therefore checks that the response contains only the patched field.

## Run everything

```bash
npm run test:all     # UI (all 3 sequentially), then API
```

## UI scenarios in detail

- **Q1:** Login as `locked_out_user`. Verify `Epic sadface: Sorry, this user has been locked out.` and that the user stays on the login page.
- **Q2:** Login as `standard_user` → Reset App State → add 3 items → cart → checkout → on the overview page, verify each product name and price, `Item total` = sum of prices, `Tax` = 8%, `Total` = item total + tax → Finish → verify `Thank you for your order!` → Reset App State → Logout.
- **Q3:** Login as `performance_glitch_user` → Reset App State → sort Name (Z to A) and verify the order → add the first product → checkout → verify all product names and the total price → Finish → verify the success message → Reset App State → Logout. This scenario gets a longer timeout because this user is slow on purpose.
