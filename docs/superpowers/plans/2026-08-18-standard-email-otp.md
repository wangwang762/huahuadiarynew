# Standard Email OTP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the insecure email-only MVP entry with a two-step, six-digit standard email verification flow whose service boundary can be switched to CloudBase without changing the UI or router.

**Architecture:** `screens-email.jsx` owns the two-step interaction and calls asynchronous methods on `window.HHAccount`. `account-service.js` is a development adapter that models CloudBase's request/verify contract, persists a verified local session, and will later be replaced by the CloudBase SDK implementation. `app.jsx` continues to route verified accounts into onboarding or the diary.

**Tech Stack:** React 18 UMD, Babel standalone JSX, browser localStorage, plain Node.js characterization tests.

**Spec:** `docs/plans/2026-08-18-standard-email-otp-design.md`

## Global Constraints

- Work only on `codex/mvp`; preserve the complete version on `main`.
- Use email plus a six-digit verification code; do not add passwords.
- Keep the existing editorial botanical visual language and 390×844 device canvas.
- While CloudBase is not configured, display development code `123456` explicitly rather than pretending that an email was sent.
- Keep CloudBase-specific logic behind `window.HHAccount`; do not place environment IDs or secrets in UI components.

---

### Task 1: Stabilize the asynchronous account adapter

**Files:**
- Modify: `account-service.js`
- Create: `tests/account-service.test.js`

**Interfaces:**
- Consumes: browser-compatible `localStorage`, `window.crypto.randomUUID`, email and six-digit code strings.
- Produces: `requestEmailCode(email): Promise<{email, verificationInfo, expiresIn, devCode}>`, `verifyEmailCode(email, code, verificationInfo): Promise<{account, isNew}>`, `getCurrentAccount()`, `markOnboarded()`, and `signOut()`.

- [ ] **Step 1: Add a characterization test for invalid emails and OTP failures**

```js
let rejected = false;
try { await api.requestEmailCode('wrong'); } catch (_) { rejected = true; }
if (!rejected) throw new Error('invalid email request accepted');

const sent = await api.requestEmailCode(' Flower.Owner@Example.com ');
try { await api.verifyEmailCode(sent.email, '000000', sent.verificationInfo); }
catch (_) { rejected = true; }
```

- [ ] **Step 2: Add verified-session and same-email recovery assertions**

```js
const first = await api.verifyEmailCode(sent.email, '123456', sent.verificationInfo);
if (!first.account.emailVerified) throw new Error('verified account creation failed');
api.markOnboarded();
api.signOut();
const resent = await api.requestEmailCode(sent.email);
const recovered = await api.verifyEmailCode(resent.email, '123456', resent.verificationInfo);
if (recovered.isNew || !recovered.account.onboarded) throw new Error('recovery failed');
```

- [ ] **Step 3: Run the adapter test**

Run: `node tests/account-service.test.js`

Expected: `STANDARD_EMAIL_OTP_FLOW_OK`

---

### Task 2: Complete the two-step journal flyleaf UI

**Files:**
- Modify: `screens-email.jsx`
- Modify: `花花日记本.html`

**Interfaces:**
- Consumes: the asynchronous `window.HHAccount` methods from Task 1 and `Icon` from `components.jsx`.
- Produces: `EmailEntry({ onEnter })`, which calls `onEnter({ account, isNew })` only after successful OTP verification.

- [ ] **Step 1: Implement the email step**

Render an email input, inline format error, and submit button labelled `寄一封回花园的信`. On success, store `verificationInfo`, normalize the displayed email, start a 60-second resend timer, and move to the code step.

- [ ] **Step 2: Implement the six-digit code step**

Render six paper-like cells over one numeric input with `autocomplete="one-time-code"`. Sanitize input with:

```js
setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
```

Verify automatically when the code reaches six digits and retain a manual submit button for accessibility.

- [ ] **Step 3: Implement correction and resend paths**

`换一个` returns to the email step and clears code, verification metadata, countdown, and errors. Once the countdown reaches zero, `没有收到？重新发送` calls `requestEmailCode` again and resets the timer.

- [ ] **Step 4: Expose the development state honestly**

When `window.HHAccount.mode === "development"`, show `开发预览验证码：123456`. Replace the old privacy warning with `验证码只用于登录花花日记本，我们不会发送营销邮件。`

- [ ] **Step 5: Bump static script versions**

In `花花日记本.html`, load `account-service.js?v=20260818b` and `screens-email.jsx?v=20260818b` so a refresh does not reuse the email-only prototype.

---

### Task 3: Verify and commit the frontend cutover

**Files:**
- Verify: `account-service.js`
- Verify: `screens-email.jsx`
- Verify: `花花日记本.html`
- Verify: `app.jsx`

**Interfaces:**
- Consumes: the account adapter and email screen from Tasks 1–2.
- Produces: a clean `codex/mvp` commit ready for CloudBase environment configuration.

- [ ] **Step 1: Run JavaScript and whitespace checks**

Run:

```bash
node --check account-service.js
node tests/account-service.test.js
git diff --check
```

Expected: no syntax or whitespace errors and `STANDARD_EMAIL_OTP_FLOW_OK`.

- [ ] **Step 2: Verify the static wiring**

Run:

```bash
rg -n "requestEmailCode|verifyEmailCode|screens-email.jsx\?v=20260818b|account-service.js\?v=20260818b" account-service.js screens-email.jsx 花花日记本.html
```

Expected: both async methods are defined and consumed, and both versioned scripts are present.

- [ ] **Step 3: Review the 390×844 flow manually**

Refresh `花花日记本.html`, enter a valid email, confirm the six code cells fit without overflow, enter `123456`, and confirm the existing onboarding or diary opens. Enter a wrong code once and confirm the error remains readable.

- [ ] **Step 4: Commit the completed cutover**

```bash
git add account-service.js screens-email.jsx 花花日记本.html tests/account-service.test.js docs/superpowers/plans/2026-08-18-standard-email-otp.md
git commit -m "feat: 改用标准邮箱验证码登录流程"
```
