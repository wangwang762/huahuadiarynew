# Garden Gate Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the explanatory email login page with a concise login form revealed by a one-time garden gate opening animation.

**Architecture:** Keep the existing `EmailEntry` authentication state and CloudBase calls intact, while extracting the decorative upper scene into a local `GardenGateScene` React component rendered by both email and OTP states. SVG supplies the illustration and CSS classes/keyframes supply the entrance, ambient plant motion, form reveal, and reduced-motion behavior without adding dependencies.

**Tech Stack:** React 18 UMD, JSX transformed by Babel in the browser, inline SVG, CSS animations, Node.js source-contract tests, in-app browser visual verification.

**Spec:** `docs/plans/2026-08-18-garden-gate-login-design.md`

## Global Constraints

- Preserve the existing CloudBase email OTP requests and validation behavior.
- The two doors must leave the viewport completely after about 1.2 seconds and must not replay on the OTP step.
- Final copy is limited to “登录花花日记本” / “用邮箱保存并找回你的花园” for email and “输入邮箱验证码” for OTP.
- Use only the existing low-saturation cream, moss green, grey green, and terracotta palette.
- Add no image request, animation package, or runtime dependency.
- Respect `prefers-reduced-motion: reduce` and keep the form immediately usable.

---

### Task 1: Lock the login-page visual contract

**Files:**
- Create: `tests/garden-gate-login.test.js`
- Test: `screens-email.jsx`
- Test: `styles.css`

**Interfaces:**
- Consumes: raw source text from `screens-email.jsx` and `styles.css`.
- Produces: a regression contract requiring `GardenGateScene`, garden-gate CSS hooks, concise copy, reduced-motion support, and removal of the old illustration/copy.

- [ ] **Step 1: Write the failing source-contract test**

```js
const fs = require("fs");
const screen = fs.readFileSync("screens-email.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of ["function GardenGateScene", "garden-gate-scene", "garden-login-form", "登录花花日记本", "用邮箱保存并找回你的花园", "输入邮箱验证码"]) {
  if (!screen.includes(marker)) throw new Error(`missing garden login marker: ${marker}`);
}
for (const marker of ["garden-door-left", "garden-door-right", "garden-stem-sway", "prefers-reduced-motion: reduce"]) {
  if (!styles.includes(marker)) throw new Error(`missing garden motion marker: ${marker}`);
}
for (const oldCopy of ["HUĀHUĀ · MVP", "初次见面", "给你的花园", "短短信笺", "留个地址吧"]) {
  if (screen.includes(oldCopy)) throw new Error(`old login content remains: ${oldCopy}`);
}
console.log("GARDEN_GATE_LOGIN_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/garden-gate-login.test.js`

Expected: FAIL with `missing garden login marker: function GardenGateScene`.

- [ ] **Step 3: Commit the failing contract with the implementation task**

Do not commit a permanently red branch. Continue directly to Task 2 and commit once the contract passes.

---

### Task 2: Build the garden scene and concise two-step form

**Files:**
- Modify: `screens-email.jsx`
- Modify: `styles.css`
- Modify: `花花日记本.html`
- Test: `tests/garden-gate-login.test.js`

**Interfaces:**
- Consumes: `EmailEntry({ onEnter })`, `HHAccount.isValidEmail`, `HHAccount.requestEmailCode`, and `HHAccount.verifyEmailCode` exactly as they exist.
- Produces: `GardenGateScene({ settled: boolean })`, with stable classes used by the CSS animation contract.

- [ ] **Step 1: Add the reusable SVG garden scene**

Implement `GardenGateScene` before `EmailEntry`. Its root must be `<div className="garden-gate-scene" aria-hidden="true">`; draw a pale sunrise, curved stems, muted leaves, small flowers, and two foreground gate panels. Apply `garden-stem-sway` to grouped stems, and `garden-door-left` / `garden-door-right` to the two panels so they translate fully beyond the viewport.

- [ ] **Step 2: Replace the old header and potted-flower illustration**

Render `<GardenGateScene settled={step === "code"} />` above the form. Remove the kicker, script status, circular illustration, handwritten note, decorative dashed circles, and old metaphor copy.

- [ ] **Step 3: Reduce the form copy without changing auth behavior**

For email state render the title `登录花花日记本`, helper `用邮箱保存并找回你的花园`, label `邮箱`, and button `获取验证码`. For code state render `输入邮箱验证码`, the selected email with `换一个`, the existing six cells, and button `进入我的花园`. Keep `sendCode`, `verifyCode`, automatic six-digit submission, resend countdown, input autocomplete values, and inline errors unchanged.

- [ ] **Step 4: Add the entrance and ambient CSS**

Add keyframes that translate `.garden-door-left` to `translateX(-112%)` and `.garden-door-right` to `translateX(112%)` over `1.2s cubic-bezier(.7,0,.25,1) forwards`; reveal `.garden-login-form` using opacity and `translateY(14px)` starting at `720ms`; give separate plant groups 4.8–6.4 second alternate sway cycles with small rotations; animate no more than two petals with a slow non-distracting drift.

- [ ] **Step 5: Add reduced-motion behavior and short-viewport fallback**

Within `@media (prefers-reduced-motion: reduce)`, disable all garden animations, hide both door panels, and show the form at final opacity and position. Within `@media (max-height: 720px)`, reduce the scene height and vertical gaps so the OTP form remains fully visible.

- [ ] **Step 6: Bump the login-page cache keys**

Update only the `styles.css` and `screens-email.jsx` query versions in `花花日记本.html` so the running preview loads the new assets.

- [ ] **Step 7: Run focused and existing regression tests**

Run:

```bash
node tests/garden-gate-login.test.js
node tests/cloudbase-app-flow.test.js
node tests/cloudbase-integration.test.js
node tests/account-service.test.js
```

Expected: `GARDEN_GATE_LOGIN_OK`, `CLOUDBASE_APP_FLOW_OK`, `CLOUDBASE_INTEGRATION_OK`, and `STANDARD_EMAIL_OTP_FLOW_OK`.

- [ ] **Step 8: Commit the working page**

```bash
git add tests/garden-gate-login.test.js screens-email.jsx styles.css 花花日记本.html
git commit -m "feat: 增加推门入园登录动效"
```

---

### Task 3: Verify the real page in the browser

**Files:**
- Verify: `screens-email.jsx`
- Verify: `styles.css`

**Interfaces:**
- Consumes: the running local preview at `http://127.0.0.1:4176/花花日记本.html`.
- Produces: visual and runtime evidence that the final page is usable and the fixed development code remains absent.

- [ ] **Step 1: Open the normal CloudBase entry**

Navigate with a fresh cache query, wait for the 1.2-second door animation plus form reveal, and confirm the DOM contains `登录花花日记本`, `用邮箱保存并找回你的花园`, the email textbox, and `获取验证码`.

- [ ] **Step 2: Verify removals and runtime health**

Confirm the DOM contains none of `HUĀHUĀ · MVP`, `初次见面`, `短短信笺`, or `123456`; inspect browser warnings/errors and accept only the existing Babel development warning.

- [ ] **Step 3: Verify final visual composition**

Capture the mobile frame after the doors have exited. Check that the flower scene occupies the upper portion without clipping, the form remains above the fold, the flowers are low saturation, and no gate or old flower icon remains visible.

- [ ] **Step 4: Run the full local suite and verify a clean worktree**

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

Expected: all six success markers and no whitespace errors.
