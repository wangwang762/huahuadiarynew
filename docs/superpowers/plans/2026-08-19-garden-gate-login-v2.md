# Full-Screen Garden Gate Login V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected half-screen sliding-door login with a full-screen perspective gate that reveals a layered garden built from the project’s real plant cutouts and a journal-paper login form.

**Architecture:** Preserve `EmailEntry` authentication state and CloudBase calls while replacing only `GardenGateScene` and the login presentation CSS. The scene is split into background atmosphere, reusable local plant-image midground, SVG foreground foliage, a paper form, and two full-screen CSS 3D door panels that rotate around their outer hinges and then disappear.

**Tech Stack:** React 18 UMD, JSX/Babel browser transform, local PNG cutouts from `assets/plants/final-v1`, inline SVG, CSS 3D transforms and keyframes, Node source-contract tests, in-app browser visual verification.

**Spec:** `docs/plans/2026-08-19-garden-gate-login-v2-design.md`

## Global Constraints

- Do not modify `sendCode`, `verifyCode`, CloudBase calls, form validation, resend countdown, or OTP auto-submit.
- V1’s basic flower SVG and upper-half sliding doors must be completely removed.
- Initial doors cover the full content area and open with `rotateY`, not plain horizontal translation.
- Midground plants must use local `assets/plants/final-v1` cutouts already used by the project.
- The final frame contains no door or doorframe and has no hard horizontal split between garden and form.
- Add no package, remote image, or animation runtime.
- Honor `prefers-reduced-motion: reduce` and keep 390 × 844 plus short mobile viewports usable.

---

### Task 1: Replace the V1 source contract with V2 requirements

**Files:**
- Modify: `tests/garden-gate-login.test.js`
- Test: `screens-email.jsx`
- Test: `styles.css`

**Interfaces:**
- Consumes: raw source text from the login component and global stylesheet.
- Produces: a regression contract requiring perspective doors, local plant imagery, layered garden classes, paper form styling, and removal of V1 markers.

- [ ] **Step 1: Update the failing contract**

Require these component markers: `GardenGateScene`, `garden-gate-world`, `garden-midground`, `garden-journal-sheet`, `assets/plants/final-v1/guibeizhu.png`, `assets/plants/final-v1/hudielan.png`, and `assets/plants/final-v1/xiuqiuhua.png`. Require these CSS markers: `perspective:`, `rotateY`, `garden-gate-light`, `garden-foreground`, and `garden-paper-reveal`. Reject the V1 markers `garden-landscape`, `gardenHillBack`, `garden-stem-sway-left`, and `garden-door::before`.

- [ ] **Step 2: Run the test and verify it fails on V1**

Run: `node tests/garden-gate-login.test.js`

Expected: FAIL with `missing garden login marker: garden-gate-world`.

---

### Task 2: Build the full-screen perspective entrance and layered garden

**Files:**
- Modify: `screens-email.jsx`
- Modify: `styles.css`
- Modify: `花花日记本.html`
- Test: `tests/garden-gate-login.test.js`

**Interfaces:**
- Consumes: `GardenGateScene({ settled: boolean })`, existing local plant PNG paths, and the unchanged `EmailEntry` auth functions.
- Produces: the final `.garden-gate-world` scene, `.garden-midground` plant stage, `.garden-foreground` foliage, `.garden-journal-sheet` form, `.garden-door-left-v2` and `.garden-door-right-v2` full-screen doors.

- [ ] **Step 1: Replace the scene markup**

Use a full-page scene root containing: a blurred cream/green atmospheric background; a midground shelf with three local cutout images (`guibeizhu`, `hudielan`, `xiuqiuhua`) at different scales and offsets; an inline SVG foreground with two large leaf clusters entering from the lower corners; a narrow central `.garden-gate-light`; and two sibling door panels that span the full root height.

- [ ] **Step 2: Move the form into the paper layer**

Wrap the unchanged email/OTP conditional content in `<main className="garden-journal-sheet garden-paper-reveal">`. Keep the concise V1 copy, but add a small date line `花园通行笺 · HUĀHUĀ` and use paper styling rather than a full-width flat section.

- [ ] **Step 3: Replace V1 CSS completely**

Delete the V1 garden block from `.garden-login-page` through its short-screen rules. Add a new full-screen perspective root, three depth layers with 620–1500 ms entrance transforms, full-height door panels with inner panel details and hinge shadows, and `rotateY(82deg)` opening keyframes anchored at `left center` / `right center`. Fade and disable door hit-testing after 1.45 seconds.

- [ ] **Step 4: Add restrained ambient motion**

Animate only the three cutout containers and the two foreground leaf groups, each with 1–2 degree rotation and different 5–8 second durations. Do not animate the PNG’s internal pixels, add particle rain, or introduce saturated colors.

- [ ] **Step 5: Preserve accessibility and short-screen behavior**

Under reduced motion, hide the doors and gate light, stop all depth and plant motion, and show the paper at final opacity/position. Under `max-height: 720px`, reduce the visual garden depth and paper padding while leaving the OTP cells and action button visible.

- [ ] **Step 6: Bump only the relevant cache keys**

Increment the `styles.css` and `screens-email.jsx` query strings in `花花日记本.html`.

- [ ] **Step 7: Run focused regressions**

Run:

```bash
node tests/garden-gate-login.test.js
node tests/cloudbase-app-flow.test.js
node tests/cloudbase-integration.test.js
node tests/account-service.test.js
git diff --check
```

Expected: all four success markers and no whitespace errors.

---

### Task 3: Inspect entrance frames and final composition

**Files:**
- Verify: `screens-email.jsx`
- Verify: `styles.css`

**Interfaces:**
- Consumes: the running local preview on port 4176.
- Produces: browser evidence for the closed-door frame, a visibly perspective middle frame, and a clean final login frame.

- [ ] **Step 1: Capture three frames**

Reload the normal entry and capture: immediately after `登录花花日记本` mounts, about 700 ms later, and after 1.8 seconds. The first must be a full-screen closed door, the second must show both panels narrowed by perspective, and the third must show no door pixels.

- [ ] **Step 2: Inspect the final frame**

Confirm the garden contains real project plant cutouts, foreground leaves overlap the paper, the paper does not read as a generic white card, all inputs and buttons remain above the fold, and there is no hard horizontal illustration boundary.

- [ ] **Step 3: Inspect runtime state**

Confirm the DOM contains the concise login copy and no `123456`; browser errors are empty and only the existing Babel development warning may remain.

- [ ] **Step 4: Run full regressions and commit**

Run:

```bash
node tests/garden-gate-login.test.js && \
node tests/cloudbase-integration.test.js && \
node tests/cloudbase-app-flow.test.js && \
node tests/account-service.test.js && \
node tests/species-library.test.js && \
node tests/onboarding-animation.test.js && \
git diff --check
```

Then commit:

```bash
git add screens-email.jsx styles.css tests/garden-gate-login.test.js 花花日记本.html
git commit -m "feat: 重做全屏花园门登录动效"
```
