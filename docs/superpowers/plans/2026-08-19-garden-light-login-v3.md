# Morning Light Journal Login V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the approved full-screen gate while replacing the generic V2 card with a bottom-opening journal page and adding coherent morning light, leaf shadows, and restrained dust.

**Architecture:** Extend `GardenGateScene` with non-interactive light layers that sit behind the doors and above the garden, then restyle the existing email and OTP markup through dedicated journal-input classes. Preserve all state, event handlers, accessibility attributes, CloudBase methods, and V2 door animation.

**Tech Stack:** React 18 UMD, JSX/Babel, inline SVG, CSS gradients/filters/keyframes, Node source-contract tests, in-app browser screenshots.

**Spec:** `docs/plans/2026-08-19-garden-light-login-v3-design.md`

## Global Constraints

- Keep `.garden-door-left-v2`, `.garden-door-right-v2`, and their `rotateY` keyframes unchanged.
- Do not change `sendCode`, `verifyCode`, OTP auto-submit, resend countdown, or CloudBase calls.
- Remove the floating rounded-card treatment and the six rounded OTP boxes.
- Morning light is cream-gold, low opacity, and enters from the upper right.
- Render at most three dust motes and stop dust/leaf-shadow motion for reduced-motion users.
- Keep the primary email input and button visible in 390 × 844 and 390 × 720 layouts.

---

### Task 1: Lock the V3 visual contract

**Files:**
- Modify: `tests/garden-gate-login.test.js`
- Test: `screens-email.jsx`
- Test: `styles.css`

**Interfaces:**
- Consumes: raw source text.
- Produces: requirements for light rays, leaf shadow, dust, journal-line input, narrow ink button, OTP underline cells, and the removal of V2 card markers.

- [ ] **Step 1: Add failing V3 assertions**

Require component markers `garden-light-rays`, `garden-leaf-shadow`, `garden-dust`, `garden-paper-date`, `garden-line-field`, `garden-ink-button`, and `garden-otp-line`. Require CSS markers `gardenLightBreathe`, `gardenLeafShadowDrift`, `gardenDustRise`, and `.garden-journal-sheet {`. Reject `border-radius: 3px 17px 14px 5px`, `box-shadow: 0 22px 42px`, and inline OTP `borderRadius: 10`.

- [ ] **Step 2: Run the test and verify V2 fails**

Run: `node tests/garden-gate-login.test.js`

Expected: FAIL on `garden-light-rays`.

---

### Task 2: Add the morning-light scene layers

**Files:**
- Modify: `screens-email.jsx`
- Modify: `styles.css`

**Interfaces:**
- Consumes: V2 `GardenGateScene({ settled })` and door layers.
- Produces: `.garden-light-rays`, `.garden-leaf-shadow`, and exactly three `.garden-dust` spans.

- [ ] **Step 1: Add light markup without changing the doors**

Insert a light-ray container after the atmosphere, a blurred leaf-shadow SVG after the midground, and three dust spans before the gate light. Mark all decorative layers through the scene root’s existing `aria-hidden="true"`.

- [ ] **Step 2: Style the light hierarchy**

Use two skewed cream-gold linear gradients from upper right with opacity below `.24`, `mix-blend-mode: soft-light`, and blur between 8 and 16 pixels. Give the leaf shadow a dark green fill below `.11` opacity and a 7.8-second alternate drift. Give the three motes 7–10 second rise cycles with staggered delays and maximum opacity `.38`.

- [ ] **Step 3: Extend reduced-motion behavior**

Keep the light rays static, stop leaf-shadow animation, and hide all dust spans under `prefers-reduced-motion: reduce`.

---

### Task 3: Rebuild email and OTP presentation as an open journal page

**Files:**
- Modify: `screens-email.jsx`
- Modify: `styles.css`
- Modify: `花花日记本.html`
- Test: `tests/garden-gate-login.test.js`

**Interfaces:**
- Consumes: current form event handlers and state values.
- Produces: `.garden-paper-date`, `.garden-line-field`, `.garden-ink-button`, `.garden-otp-line`, and a full-width bottom paper sheet.

- [ ] **Step 1: Update the paper header**

Wrap the kicker and `08 / 19` in `.garden-paper-meta`, reduce the title weight, and keep the existing helper copy.

- [ ] **Step 2: Convert the email input to a line field**

Move the existing icon and input into `.garden-line-field`; remove inline background, radius, border, and shadow styles; retain `type`, `inputMode`, `autoComplete`, `aria-invalid`, `aria-describedby`, value, and change handler.

- [ ] **Step 3: Convert both primary actions to ink buttons**

Add `.garden-ink-button` to the email and OTP submit buttons, remove full-width inline styles, and keep all disabled/busy behavior and labels.

- [ ] **Step 4: Convert OTP cells to underlines**

Replace the six rounded boxes with `.garden-otp-line` cells that show one digit above a bottom border. Keep the invisible single input, click-to-focus, numeric mode, one-time-code autocomplete, six-digit restriction, and error state.

- [ ] **Step 5: Replace card geometry with bottom paper geometry**

Set the sheet left/right/bottom to `0`, top near `405px`, remove all-around border, use a curved `clip-path`/pseudo-element at the top, keep only a subtle top shadow, and let the paper continue below the viewport. Redraw foreground leaves so they remain within the lower corners and do not cross the form’s central area.

- [ ] **Step 6: Add 720px short-screen overrides and bump cache keys**

Raise the paper top, tighten vertical spacing and button height for short screens. Increment only the stylesheet and login JSX cache query strings.

- [ ] **Step 7: Run focused tests**

Run:

```bash
node tests/garden-gate-login.test.js
node tests/cloudbase-app-flow.test.js
node tests/cloudbase-integration.test.js
node tests/account-service.test.js
git diff --check
```

Expected: all focused markers pass.

---

### Task 4: Visual and full regression verification

**Files:**
- Verify: `screens-email.jsx`
- Verify: `styles.css`

**Interfaces:**
- Consumes: running preview on port 4176.
- Produces: final-frame evidence for light, garden visibility, journal integration, and form usability.

- [ ] **Step 1: Inspect the final email frame**

Confirm the door sequence remains intact, morning rays are visible but not white streaks, the journal page begins near the lower half and has no floating-card outline, the line field and narrow button are visible, and foreground leaves stay in the corners.

- [ ] **Step 2: Inspect runtime output**

Confirm concise login text and no fixed `123456`; accept only the existing Babel warning.

- [ ] **Step 3: Run the full suite and commit**

Run all six local tests plus `git diff --check`, then commit the four implementation files with `feat: 优化花园登录光效与日记页`.
