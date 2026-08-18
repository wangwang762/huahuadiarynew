# CloudBase MVP Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the H5 prototype to CloudBase email OTP and per-user plant and diary data while preserving an explicit demo preview mode.

**Architecture:** A pinned CloudBase Web SDK initializes from a public environment config. `account-service.js` owns authentication, `data-service.js` owns document conversion and CRUD, and `app.jsx` owns asynchronous boot and UI routing. Production accounts never fall back to demo data; `?demo=1` is the only route that uses authored seed plants.

**Tech Stack:** React 18 via Babel, CloudBase Web SDK 3.8.0 via CDN, CloudBase document database, Node source-level regression tests.

**Spec:** `docs/plans/2026-08-18-cloudbase-mvp-data-design.md`

## Global Constraints

- CloudBase environment is `huahuadiary-d4gajnlumc8432f6c` in `ap-shanghai`.
- Never expose SecretId, SecretKey, SMTP password, or admin credentials in browser code.
- Real accounts start with an empty garden and only see documents owned by their UID.
- Demo seed plants are available only when the URL contains `demo=1`.
- Pin `@cloudbase/js-sdk` to version `3.8.0`; do not use `latest`.
- Do not add photo upload, AI calls, weather persistence, or a fourth collection in this phase.

---

### Task 1: CloudBase configuration and authentication boundary

**Files:**
- Create: `cloudbase-config.js`
- Modify: `account-service.js`
- Modify: `花花日记本.html`
- Modify: `tests/account-service.test.js`
- Create: `tests/cloudbase-integration.test.js`

**Interfaces:**
- Produces: `window.HHCloud.get()` returning `{ app, auth, db }`; `window.HHAccount.restoreSession()`, `requestEmailCode(email)`, `verifyEmailCode(email, code, verificationInfo)`, `getCurrentAccount()`, and `signOut()`.
- Consumes: `window.cloudbase`, environment ID, region, and CloudBase Auth v3 responses.

- [ ] **Step 1: Add failing integration assertions**

Assert that the HTML pins `cloudbase.full.js` version `3.8.0`, config contains the environment and region, account service contains `signInWithOtp` and `verifyOtp`, and production source no longer contains `DEV_CODE` or `123456`.

- [ ] **Step 2: Run the tests and confirm failure**

Run: `node tests/cloudbase-integration.test.js`
Expected: FAIL on missing `cloudbase-config.js`.

- [ ] **Step 3: Implement lazy CloudBase initialization**

Initialize with `cloudbase.init({ env: "huahuadiary-d4gajnlumc8432f6c", region: "ap-shanghai" })`. Normalize the SDK's function-style or property-style auth surface and throw a readable error when the CDN is unavailable.

- [ ] **Step 4: Replace the development OTP adapter**

Use `auth.signInWithOtp({ email, options: { shouldCreateUser: true } })`; retain the returned verifier in memory and return serializable `verificationInfo`. Verify with the returned `verifyOtp({ token, messageId })` callback when available, otherwise call `auth.verifyOtp({ email, token, messageId })`. Translate CloudBase errors into existing Chinese UI messages.

- [ ] **Step 5: Add session restore and logout**

`restoreSession()` reads `auth.getSession()`, normalizes `user.id`/`user.uid` and email into the cached account, and returns null for no session. `signOut()` calls the CloudBase auth method and clears the cache.

- [ ] **Step 6: Update tests and HTML order**

Load the pinned SDK before `cloudbase-config.js`, then load account and data services before screens. Update the account test to use a CloudBase auth stub rather than localStorage.

### Task 2: Per-user data service and demo isolation

**Files:**
- Create: `data-service.js`
- Modify: `data.js`
- Modify: `tests/cloudbase-integration.test.js`

**Interfaces:**
- Produces: `window.HHData.bootstrap(account)`, `createPlantWithFirstEntry(plant)`, `updatePlant(plant)`, `addDiaryEntry(plantId, entry)`, and `setOnboarded(account)`.
- Consumes: `window.HHCloud.get().db`, current account UID, `window.DEMO_PLANTS`, and the collections `profiles`, `plants`, `diary_entries`.

- [ ] **Step 1: Add failing collection and ownership assertions**

Require all three collection names, `ownerId` writes, explicit `demo=1`, and a `window.DEMO_PLANTS` snapshot. Reject implicit fallback to seed plants.

- [ ] **Step 2: Preserve seed data as an immutable demo snapshot**

After species-library construction, deep-clone the current authored array into `window.DEMO_PLANTS`. The data service replaces `window.PLANTS` with database results in normal mode and with a fresh clone of `DEMO_PLANTS` only in demo mode.

- [ ] **Step 3: Implement document conversion and bootstrap**

Fetch the UID profile, plants ordered by creation time, and diary entries for the UID; group entries by `plantId`, strip CloudBase metadata fields from UI objects, and assign the hydrated list to `window.PLANTS`.

- [ ] **Step 4: Implement conservative writes**

Create the plant without its nested diary, create its first diary entry, then update the profile. Update plants and add diary entries only after a current UID is available; always write `ownerId` and ISO timestamps.

### Task 3: Asynchronous App boot and save flow

**Files:**
- Modify: `app.jsx`
- Modify: `screens-onboard.jsx`
- Modify: `screens-email.jsx`
- Create: `tests/cloudbase-app-flow.test.js`

**Interfaces:**
- Consumes: `HHAccount.restoreSession()`, `HHData.bootstrap(account)`, and the CRUD methods from Task 2.
- Produces: loading, retryable error, email, onboarding, and diary states driven by CloudBase.

- [ ] **Step 1: Add failing boot-flow assertions**

Require `restoreSession`, `HHData.bootstrap`, a visible retry action, awaited onboarding persistence, and awaited plant/diary updates.

- [ ] **Step 2: Add a boot state**

Initialize the router only after session restoration and data bootstrap. Show a branded lightweight loading screen while pending and a retryable “花园暂时没有连上” screen when boot fails.

- [ ] **Step 3: Bootstrap after OTP verification**

Await data bootstrap inside `enterGarden`, merge the returned profile onboarding flag into the account, then route to onboarding or diary. Keep the email button busy until this completes so errors remain on the email page.

- [ ] **Step 4: Await onboarding persistence**

Pass a promise-returning completion callback into `Onboard`. Disable the final diary button while saving, show inline errors on failure, and navigate only after `createPlantWithFirstEntry` and profile onboarding succeed.

- [ ] **Step 5: Persist updates and new diary entries**

Await `updatePlant` and `addDiaryEntry` before committing the corresponding in-memory mutation. Convert the capture and chat callbacks to awaitable handlers.

### Task 4: Console setup handoff and verification

**Files:**
- Create: `docs/cloudbase-console-setup.md`
- Create: `cloudbase-security-rules.json`
- Test: all Node test scripts.

**Interfaces:**
- Produces: exact collection names and copyable owner-only rules for the user to configure in the CloudBase console.

- [ ] **Step 1: Document the three console actions**

Document enabling email OTP, creating `profiles`, `plants`, and `diary_entries`, and adding localhost plus the later production host to Web security sources.

- [ ] **Step 2: Provide owner-only rule templates**

Provide explicit create/read/update/delete expressions for profiles and owned documents, with a warning to test rules before production.

- [ ] **Step 3: Run the full local suite**

Run: `node tests/cloudbase-integration.test.js && node tests/cloudbase-app-flow.test.js && node tests/account-service.test.js && node tests/species-library.test.js && node tests/onboarding-animation.test.js && git diff --check`
Expected: every script prints its OK marker and the diff check is empty.

- [ ] **Step 4: Verify both local modes**

Open normal mode and confirm the real email screen does not expose `123456`. Open `?demo=1` and confirm the 26 authored plants remain available without a CloudBase session. Final email delivery and database persistence remain blocked until the console actions are completed.

- [ ] **Step 5: Commit**

```bash
git add cloudbase-config.js data-service.js account-service.js app.jsx screens-email.jsx screens-onboard.jsx data.js tests docs/cloudbase-console-setup.md cloudbase-security-rules.json '花花日记本.html'
git commit -m "feat: 接入 CloudBase 真实账户与数据"
```
