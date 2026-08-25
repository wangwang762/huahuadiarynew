# Minimal Journal Guest Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the crowded collage login with a one-photo minimal field-journal screen and let users skip authentication into a locally persisted plant-creation flow.

**Architecture:** Keep the existing email OTP service and router, but add an explicit guest-entry callback from `EmailEntry` to `App`. Extend `HHData` with a localStorage-backed guest adapter selected by `account.guest`, while leaving CloudBase PostgreSQL behavior unchanged. Reuse the current onboarding flow as the first plant-creation experience.

**Tech Stack:** React 18 browser JSX, CSS, localStorage, Node source-contract tests, Playwright browser verification

**Spec:** `docs/plans/2026-08-25-minimal-journal-guest-login-design.md`

## Global Constraints

- The final login canvas contains exactly one plant photograph and no pin, brass clip, second photograph, stamp, star, or wave doodle.
- Keep the current email OTP request, verification, countdown, automatic six-digit submit, and CloudBase PostgreSQL paths unchanged.
- The secondary action copy is `跳过登录，先添加植物` and routes directly to the existing onboarding flow.
- Guest persistence uses the versioned key `huahua.guestGarden.v1` and never calls CloudBase.
- Do not add a guest-to-account merge flow in this iteration.
- Preserve `prefers-reduced-motion: reduce` support and avoid horizontal overflow at 390×844.

---

### Task 1: Lock the minimal login and guest-flow contracts

**Files:**
- Modify: `tests/garden-gate-login.test.js`
- Create: `tests/guest-data-service.test.js`
- Modify: `tests/cloudbase-app-flow.test.js`

**Interfaces:**
- Consumes: current `EmailEntry`, `App`, and `HHData` source contracts
- Produces: regression markers for `MinimalJournalScene`, `onSkip`, `enterGuestGarden`, `GUEST_STORAGE_KEY`, and local persistence behavior

- [ ] **Step 1: Replace the old collage markers with the minimal visual contract**

Require `MinimalJournalScene`, one `collage-polaroid`, `collage-tape`, `跳过登录，先添加植物`, `onSkip`, and the existing OTP copy. Reject `collage-polaroid-right`, `collage-pin`, `collage-brass-clip`, `collage-stamp`, and `collage-doodle` from `screens-email.jsx`.

- [ ] **Step 2: Add a guest data unit test with an in-memory localStorage stub**

Load `data-service.js` in a VM context, call `bootstrap({ id: "guest-local", guest: true })`, then verify that `createPlantWithFirstEntry`, `updatePlant`, and `addDiaryEntry` write and recover data from `huahua.guestGarden.v1` without calling `HHCloud.get()`.

- [ ] **Step 3: Extend the app-flow test**

Require `enterGuestGarden`, `<EmailEntry onEnter={enterGarden} onSkip={enterGuestGarden} />`, and a guest account object containing `guest: true`; require that the next stack view is `onboard`.

- [ ] **Step 4: Run the focused tests and verify failure**

Run: `node tests/garden-gate-login.test.js && node tests/guest-data-service.test.js && node tests/cloudbase-app-flow.test.js`

Expected: FAIL because the minimal scene and guest adapter do not exist yet.

- [ ] **Step 5: Commit the failing contracts**

```bash
git add tests/garden-gate-login.test.js tests/guest-data-service.test.js tests/cloudbase-app-flow.test.js
git commit -m "test: define minimal guest login flow"
```

### Task 2: Implement local guest persistence and routing

**Files:**
- Modify: `data-service.js`
- Modify: `app.jsx`

**Interfaces:**
- Consumes: guest account `{ id: "guest-local", email: "", guest: true, onboarded: false }`
- Produces: `GUEST_STORAGE_KEY`, guest-aware `HHData` methods, and `enterGuestGarden(): Promise<void>`

- [ ] **Step 1: Add the versioned guest store helpers**

Define `GUEST_STORAGE_KEY = "huahua.guestGarden.v1"`, `emptyGuestGarden()`, `readGuestGarden()`, and `writeGuestGarden(garden)`. Store `{ profile, plants }`; clone values at the boundary so UI mutation does not mutate storage implicitly.

- [ ] **Step 2: Route all HHData operations by active account**

When `activeAccount.guest` is true, `bootstrap` restores local plants, `setOnboarded` updates the local profile, `createPlantWithFirstEntry` prepends or replaces the plant, `updatePlant` replaces the matching plant, and `addDiaryEntry` prepends the entry to the matching plant diary. Return the same shapes as the CloudBase branches.

- [ ] **Step 3: Add guest entry to the app router**

Implement `enterGuestGarden()` to bootstrap the guest account, set `account` and `window.PLANTS`, then replace the stack with `[{ view: "onboard" }]`. Pass it to the email screen as `onSkip`.

- [ ] **Step 4: Run guest and cloud flow tests**

Run: `node tests/guest-data-service.test.js && node tests/cloudbase-app-flow.test.js`

Expected: `GUEST_DATA_SERVICE_OK` and `CLOUDBASE_APP_FLOW_OK`.

- [ ] **Step 5: Commit guest persistence**

```bash
git add data-service.js app.jsx tests/guest-data-service.test.js tests/cloudbase-app-flow.test.js
git commit -m "feat: add local guest garden"
```

### Task 3: Build the one-photo minimal field-journal login

**Files:**
- Modify: `screens-email.jsx`
- Modify: `styles.css`
- Modify: `花花日记本.html`

**Interfaces:**
- Consumes: `EmailEntry({ onEnter, onSkip })`
- Produces: `MinimalJournalScene`, `.minimal-journal-photo`, `.collage-guest-skip`, and the retained OTP form

- [ ] **Step 1: Reduce the scene markup**

Rename the scene component to `MinimalJournalScene`. Keep the corkboard, back sheet, main lined sheet, opening covers, one龟背竹 polaroid, and one tape strip. Remove the second photograph, pins, clip, stamp, doodles, and their JSX hooks.

- [ ] **Step 2: Recompose the form hierarchy**

Place the quiet English meta above `登录花花日记本`, keep the helper one line, replace the sticker label with a plain `邮箱` label, make the main action full width with a 44px height, and add `<button type="button" className="collage-guest-skip" onClick={onSkip}>跳过登录，先添加植物</button>` below it.

- [ ] **Step 3: Rewrite the login CSS with restrained journal styling**

Position the single photo in the upper-right negative space, attach one translucent tape strip to its top edge, move the form upward, remove thick coral offset shadows, and use the existing paper/green tokens. Keep cover-opening and form-reveal keyframes; update reduced-motion selectors to only current elements.

- [ ] **Step 4: Bump the changed source cache keys**

Increment query strings for `data-service.js`, `screens-email.jsx`, `styles.css`, and `app.jsx` in `花花日记本.html`.

- [ ] **Step 5: Run the login contract and full suite**

Run: `node tests/garden-gate-login.test.js && npm test && npm run build`

Expected: the focused test prints `GARDEN_GATE_LOGIN_OK`; all test markers pass; the CloudBase build completes.

- [ ] **Step 6: Commit the interface**

```bash
git add screens-email.jsx styles.css 花花日记本.html tests/garden-gate-login.test.js
git commit -m "feat: simplify journal login screen"
```

### Task 4: Verify guest persistence in the browser

**Files:**
- Create: `scripts/test-guest-login-browser.cjs`

**Interfaces:**
- Consumes: local H5 URL and browser localStorage
- Produces: automated evidence for login layout, skip routing, local persistence, reload recovery, and console cleanliness

- [ ] **Step 1: Add the browser scenario**

At 390×844, open a fresh-cache URL, wait for the cover animation, assert exactly one plant photo and the visible skip action, verify `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, click skip, and assert the onboarding species-selection heading appears. Seed `huahua.guestGarden.v1`, reload, click skip again, and assert the restored plant is available in `window.PLANTS`.

- [ ] **Step 2: Run browser verification and capture a screenshot**

Run the project preview server and then `node scripts/test-guest-login-browser.cjs`.

Expected: `GUEST_LOGIN_BROWSER_OK`, no page exceptions, no horizontal overflow, and a screenshot showing one-photo minimal hand账 composition.

- [ ] **Step 3: Re-run repository checks**

Run: `npm test && npm run build && git diff --check`

Expected: all pass.

- [ ] **Step 4: Commit browser coverage**

```bash
git add scripts/test-guest-login-browser.cjs
git commit -m "test: cover guest login in browser"
```

### Task 5: Balance the journal header with one botanical sticker

**Files:**
- Modify: `screens-email.jsx`
- Modify: `styles.css`
- Modify: `tests/garden-gate-login.test.js`
- Modify: `花花日记本.html`

**Interfaces:**
- Consumes: the existing minimal one-photo journal scene
- Produces: `.journal-botanical-sticker` and `.journal-sticker-pin` as the only additional decorative group

- [ ] **Step 1: Extend the login visual contract**

Require one `journal-botanical-sticker`, one `journal-sticker-pin`, and the `GROW SLOWLY` label while continuing to reject the former generic collage pin and multi-decoration hooks.

- [ ] **Step 2: Add the botanical sticker markup and styling**

Render a compact CSS/SVG botanical label in the upper-left blank area, use a muted coral paper color and dark red pin, and keep it behind the login form. Move `.collage-login-form` down by approximately 18px without changing the OTP or guest behavior.

- [ ] **Step 3: Bump the affected cache keys and verify**

Run: `npm test && npm run build && git diff --check`

Expected: all test markers pass, the CloudBase bundle builds, and the 390×844 browser screenshot has no overlap or horizontal overflow.
