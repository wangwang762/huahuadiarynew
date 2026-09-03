# Friend QR Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a branded, shareable and scan-verified QR card for the public Huahua Diary H5.

**Architecture:** Generate the QR matrix programmatically from the exact public URL, compose it into a self-contained SVG poster, and rasterize that SVG to PNG for sharing. Verify the exported PNG by decoding it and comparing the decoded payload with the source URL.

**Tech Stack:** SVG, Python qrcode, Sharp or available SVG rasterizer, OpenCV QRCodeDetector

**Spec:** `docs/plans/2026-09-03-friend-qr-card-design.md`

## Global Constraints

- Canvas is exactly 1080×1350.
- QR payload is exactly `https://huahuadiary-d4gajnlumc8432f6c-1322727508.tcloudbaseapp.com/?v=20260903-account`.
- Visible copy says `建议用 Safari 打开`.
- Instruction copy says `打开后点击分享 → 添加到主屏幕`.
- Preserve QR quiet zone and do not place decoration over finder patterns.

---

### Task 1: Generate and verify the invitation card

**Files:**
- Create: `assets/share/huahua-diary-friend-qr.svg`
- Create: `assets/share/huahua-diary-friend-qr.png`
- Create: `scripts/generate-friend-qr.py`

**Interfaces:**
- Consumes: exact public URL from the design spec
- Produces: a 1080×1350 SVG source and PNG sharing asset

- [ ] **Step 1: Check local QR and raster dependencies**

Run Python import checks for `qrcode`, `PIL`, and `cv2`, and check the workspace Node runtime for `sharp` if rasterization is needed.

- [ ] **Step 2: Implement deterministic QR and SVG generation**

Write `scripts/generate-friend-qr.py` with constants for the URL, canvas dimensions, palette, text, QR size, and output paths. Generate an error-correction-M QR matrix with a four-module quiet zone and render each dark module as an SVG rectangle.

- [ ] **Step 3: Export the PNG**

Rasterize the SVG at exactly 1080×1350 into `assets/share/huahua-diary-friend-qr.png` without JPEG compression.

- [ ] **Step 4: Verify the payload**

Decode the PNG QR region with OpenCV `QRCodeDetector` and assert that the decoded value equals the source URL byte-for-byte.

- [ ] **Step 5: Visually inspect and commit**

Open the PNG at original detail, confirm hierarchy and safe margins, then commit only the source script, SVG, PNG, design spec, and implementation plan.
