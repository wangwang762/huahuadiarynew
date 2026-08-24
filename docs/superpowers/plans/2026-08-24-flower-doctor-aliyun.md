# Flower Doctor Aliyun Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route Flower Doctor photo consultations through Alibaba Cloud Function Compute and DashScope without exposing the model API key in the browser.

**Architecture:** Keep CloudBase auth, PostgreSQL, and static hosting unchanged. Add a Node.js 20 FC 3.0 HTTP handler that preserves the existing chat/summary JSON contract, then replace the browser's `app.callFunction` transport with `fetch` against a separately configured HTTPS endpoint.

**Tech Stack:** Vanilla browser JavaScript, React UMD, Node.js 20 CommonJS, Alibaba Cloud Function Compute 3.0, DashScope OpenAI-compatible API, Node test scripts.

**Spec:** `docs/flower-doctor-aliyun-spec.md`

## Global Constraints

- Do not place `DASHSCOPE_API_KEY` or Alibaba Cloud account credentials in source code, build output, GitHub, or browser storage.
- Preserve the existing request fields `action`, `plant`, `image`, and `messages`, and the existing reply/summary response shape.
- Do not change CloudBase email authentication, PostgreSQL tables, or diary persistence.
- Use Node.js 20, handler `index.handler`, timeout 90 seconds, memory 256 MB, and minimum instances 0.
- Treat the public anonymous endpoint as MVP-only and document the abuse risk and quota-stop requirement.

---

### Task 1: Alibaba FC HTTP Handler

**Files:**
- Create: `aliyun-functions/flower-doctor/index.js`
- Create: `aliyun-functions/flower-doctor/package.json`
- Test: `tests/doctor-aliyun.test.js`

**Interfaces:**
- Consumes: FC 3.0 HTTP event JSON containing `requestContext.http.method`, `body`, and `isBase64Encoded`.
- Produces: `exports.handler(event, context) -> { statusCode, headers, body }` where `body` is serialized `{ ok, reply|summary|message }`.

- [ ] **Step 1: Write the failing handler test**

Create a test that stubs `global.fetch`, sends `OPTIONS`, `chat`, and `summary` events, and asserts CORS, HTTP status, and the stable response contract.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/doctor-aliyun.test.js`
Expected: FAIL because `aliyun-functions/flower-doctor/index.js` does not exist.

- [ ] **Step 3: Implement the FC handler**

Port the existing safe prompt, image/message limits, DashScope timeout, JSON summary normalization, and errors into a CommonJS `index.handler`; parse FC HTTP events and answer `OPTIONS` without calling the model.

- [ ] **Step 4: Run the handler test**

Run: `node tests/doctor-aliyun.test.js`
Expected: `FLOWER_DOCTOR_ALIYUN_OK`.

### Task 2: Browser HTTP Transport

**Files:**
- Create: `doctor-config.js`
- Modify: `doctor-service.js`
- Modify: `花花日记本.html`
- Modify: `scripts/build-cloudbase.mjs`
- Modify: `tests/doctor-api.test.js`

**Interfaces:**
- Consumes: `window.HHDoctorConfig.endpoint` and the existing `HHDoctor.reply` / `HHDoctor.summarize` arguments.
- Produces: browser `fetch(endpoint, { method: "POST", headers, body })` calls with an 85-second abort timeout and the unchanged public `window.HHDoctor` API.

- [ ] **Step 1: Change the API test to require HTTP transport**

Assert that the client uses `fetch`, reads `window.HHDoctorConfig.endpoint`, never calls `app.callFunction`, and that HTML/build output include `doctor-config.js` before `doctor-service.js`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/doctor-api.test.js`
Expected: FAIL because the CloudBase transport is still present.

- [ ] **Step 3: Implement the browser transport and endpoint config**

Add an empty endpoint config with a clear configuration error, validate HTTPS except for localhost development, POST the existing payload, parse JSON safely, and surface function/model errors without a fabricated diagnosis. Use `qwen3-vl-flash` as the low-cost MVP default.

- [ ] **Step 4: Run API and UI tests**

Run: `node tests/doctor-api.test.js && node tests/doctor-empty-state.test.js`
Expected: both pass.

### Task 3: Deployment Contract and Regression

**Files:**
- Create: `aliyun-functions/flower-doctor/s.yaml`
- Create: `docs/flower-doctor-aliyun-setup.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: Alibaba account-specific deployment credentials supplied outside the repository and the function URL returned after deployment.
- Produces: a Git-tracked FC 3.0 deployment definition and exact console steps for environment variables, HTTP trigger, CORS, quota stop, and endpoint wiring.

- [ ] **Step 1: Add the FC deployment definition and setup guide**

Define region `cn-hangzhou`, function `huahua-flower-doctor`, runtime `nodejs20`, code directory `aliyun-functions/flower-doctor`, handler `index.handler`, memory 256, timeout 90, internet access, and an anonymous POST HTTP trigger; omit all secrets and account identifiers.

- [ ] **Step 2: Add the Alibaba handler test to `npm test` automatically**

The existing test glob already runs `tests/*.test.js`; verify no test script exception is needed.

- [ ] **Step 3: Run full verification**

Run: `npm test && npm run build && git diff --check`
Expected: all tests pass, `dist/cloudbase` contains `doctor-config.js`, and no whitespace errors exist.

- [ ] **Step 4: Commit and push**

Run: `git add` only the migration files and intentional modifications, commit as `feat: route flower doctor through aliyun`, then push `codex/mvp`.
