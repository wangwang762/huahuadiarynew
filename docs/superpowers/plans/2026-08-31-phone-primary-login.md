# Phone-primary Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task by task.

**Goal:** Add phone OTP as the primary login, retain email OTP as fallback, and prevent the login opening animation from replaying inside the same app session.

**Architecture:** Keep all CloudBase authentication calls behind `window.HHAccount`. Turn the existing email screen into a channel-aware OTP screen without changing the app router contract. Track the one-time intro in `sessionStorage`, while later account binding remains an authenticated account-management operation.

**Tech Stack:** React 18 browser components, CloudBase Web SDK v3, static Node regression tests, CSS.

### Task 1: Authentication adapter

**Files:** Modify `account-service.js`; modify `tests/account-service.test.js`.

Add phone normalization and validation, `requestPhoneCode`, `verifyPhoneCode`, and phone extraction in restored account data. Use `auth.getVerification({ phone_number })` and `auth.signInWithSms(...)`. Preserve the current email callback/fallback flow.

### Task 2: Phone-first login UI

**Files:** Modify `screens-email.jsx`, `styles.css`, and `tests/garden-gate-login.test.js`.

Add phone/email channel switching, channel-specific labels, inputs, code copy and handlers. Keep one shared OTP interaction and the quiet guest skip action.

### Task 3: One-time opening animation

**Files:** Modify `app.jsx`, `screens-email.jsx`, and add `tests/login-intro-once.test.js`.

Consume a session-scoped intro flag at cold entry. Pass `playIntro` into the login screen; guest account entry and sign-out routes must pass false. Add an instant settled visual state that cannot replay the cover animation.

### Task 4: Account copy and verification

**Files:** Modify `screens-account.jsx` and `docs/cloudbase-console-setup.md`.

Show the active phone or email, revise recovery copy, and document enabling SMS verification plus the user-management location. Run `npm test` and `npm run build`; do not label the change cloud-accepted until a real SMS and device login pass.
