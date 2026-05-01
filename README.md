# Handoff: Custom Rule Creation (Eleos)

## Overview

This is a clinical compliance feature for **Eleos Health**: an interface that lets compliance leaders create, validate, and manage custom documentation rules that the Eleos engine runs against clinical notes (intake assessments, progress notes, treatment plans, etc.).

The feature is structured as:

1. **Rule Management** — list of all rules in the org plus the Eleos Library, with a side panel for full rule management (edit, disable, re-enable, duplicate, view stats, link to Dashboard)
2. **A 4-step creation flow** — Define → Clarify → Validate → Activate
3. **Tweaks panel** — runtime variants for the validation streak counter

Source PRD: `Compliance-PRD_ Custom Rule Creation`. The product requirements (rule states, validation gating, surface activation, library adoption, etc.) are encoded into the prototype directly.

---

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — clickable prototypes that show intended look and behavior. They are **not production code to copy directly**.

The task is to **recreate these designs in the target Eleos codebase** using its existing patterns (component library, design tokens, routing, state management, data layer). If no environment exists yet, choose the most appropriate framework (most likely React + TypeScript given the JSX prototype) and implement against Eleos's existing brand/design system.

The HTML uses placeholder fonts (Inter + Source Serif 4) and a placeholder teal accent — both should be **replaced with Eleos's real brand tokens** during implementation. All copy, IA, layout, interaction, and state are intentional and should be preserved.

---

## Fidelity

**High-fidelity prototype.** Pixel-perfect mockups with final layout, typography scale, spacing, micro-interactions, empty states, and error/confirmation flows. Recreate the UI faithfully using the codebase's existing libraries and patterns.

The **visual aesthetic** (color, type, density) is a placeholder calm-clinical-SaaS direction — intended to be re-skinned to Eleos brand. The **information architecture, copy, layout, and interaction patterns** are final.

---

## Screens / Views

### 1. Rule Management (`view = "manage"`)

**Purpose:** A compliance lead lands here to find a rule, see its health, manage it, or start a new one.

**Layout:**
- Two-column app shell: 240px sidebar + flex main column
- Sticky 56px topbar (breadcrumbs left, user/notifications right)
- Page padding 28px × 32px, max-width 1400px
- Page header: H1 + sub-copy left, primary "New rule" + secondary "Browse Library" right
- Two tabs: **My organization** and **Eleos Library** (count badge in each)
- Filter bar: search input + segmented status filter (org tab only) + doc-type select
- One unified table component for both tabs — column meaning swaps based on tab
- Clicking a row opens a **right-side drawer** (640px) with full management surface

**Table columns (org tab):** Rule (name + 1-line purpose) · Status · Doc type · Surfaces (Dashboard / LQA chips) · Last 7 days (runs · fails) · Updated (date + author)

**Table columns (library tab):** Rule (name + purpose) · Compatibility (Compatible / Partial / Not compatible) · Doc type · Adoptions (count) · Programs

**Status badges (with hover tooltips explaining meaning):**
- Draft — neutral, "Work in progress. Only visible to you."
- Submitted — neutral, "Frozen for validation. Pass 3 consecutive agreements to activate."
- Active — green, "Running in production against new notes."
- Disabled — neutral muted, "Turned off. History preserved. Can be re-enabled."

**Side Panel (drawer):** Header with status + priority badges + version, rule name, purpose, close button. Then primary actions row (varies by status). Then panel sections:
- **Last 7 days** (active rules only) — 3 stat cards (Evaluated / Failed / Health) + a "Filter Dashboard by this rule" connector card
- **Where this runs** — surface chips with explanation
- **Scope** — doc type, programs, priority key/value rows
- **Version history** — vertical timeline showing last 4 changes
- **Manage** — vertical stack of actions: Duplicate as draft, Change surfaces, Disable / Re-enable

**Primary CTAs vary by status:**
- Draft → "Continue editing" + "Duplicate"
- Submitted → "Continue validation" + "Back to Clarify"
- Active → "Edit rule" + "View in Dashboard"
- Disabled → "Re-enable rule" + "Edit rule"
- Library row → "Adopt & customize" + "Duplicate as draft"

**Confirmations:** Disable, Re-enable, Duplicate, and Library Adopt all use a centered modal with explicit consequences. Disable specifically lists what stays (history, results) and what stops.

---

### 2. Define stage (`view.step = "define"`)

**Purpose:** Capture the rule logic in plain language. **Critically separates** rule logic from metadata.

**Layout:** Same shell + topbar + breadcrumb. Stepper bar below topbar: Define · Clarify · Validate · Activate (current step filled, completed steps with check). Two-column content: main 1fr + sticky right rail 380px.

**Three numbered sections (left column):**
1. **What the rule checks** — Rule name, "What should this rule check, and why?" (textarea), "What does PASS look like?" (textarea, required), "What does FAIL look like?" (textarea, optional with hint that "anything that doesn't pass" is the default)
2. **Reference materials** — Drop zone to attach policy/regulation PDFs/DOCX, plus a placeholder row to add example notes for context
3. **Where it applies** — Doc type select (required), priority segmented control, programs multi-select pills, services multi-select pills

**Right rail: "Fields used by this rule"** — Additive list, NOT NLP-scanning the description. Empty state with "Add a field" CTA. Each row shows field name + group + LQA scrape level + fill %. Fields suggested in Clarify get a small "Clarify" chip.

**CTAs:** "Save draft & exit" + "Continue to Clarify" (disabled until name + description + pass criteria + doc type are present). Auto-save indicator below.

---

### 3. Clarify stage (`view.step = "clarify"`)

**Purpose:** Sharpen the **logic only** — not metadata. AI asks targeted questions about edge cases.

**Layout:** Two-column, ~1.1fr / 1fr. Left = live rule definition card. Right = sticky Q&A card.

**Live rule definition card (left):**
- Header: "Rule definition" + confidence indicator (Low/Medium/High based on # answered)
- Body: serif-typeset declarative statement
- Two-column rubric: PASS WHEN (green label) | FAIL WHEN (red label)
- Below: "Where this rule will run" card showing Dashboard + LQA compatibility based on field presence

**Q&A card (right):**
- Header with AI mark, "Sharpening questions", count, progress bar
- Three questions, each with category tag (Pass criteria / Missing data / Quantity), question text, 2–3 option pills with title + detail + optional "recommended" chip
- Questions reveal progressively — earlier ones full opacity, future ones at 0.4 opacity
- After all answered: free-text follow-up textarea + "Send to AI" button
- Footer note: "These questions only affect rule logic. Scope and metadata stay as you set them in Define."

The 3 canonical questions are:
- Specificity (any goal text / measurable / SMART)
- Missing data (Fail / N/A)
- Count (one is enough / multiple required)

`composeDefinition(draft, answers)` in `src/form_clarify.jsx` shows the exact mapping from answers → statement / pass / fail.

---

### 4. Validate stage (`view.step = "validate"`)

**Purpose:** Sandbox-eval the rule against real notes from the org's feed. Gate on **3 consecutive agreements** before allowing activation.

**Layout:** Sticky banner card at top with the agreement counter + status text. Two-column main: sample note (left) + AI evaluation card (right, sticky).

**Agreement counter** (3 variants exposed via Tweaks panel):
- `dots` (default) — 3 small circles that fill green
- `progress` — horizontal bar + "N/3" numeral
- `streak` — large numeral with "/ 3 in a row"

**Sample note card:** Doc type badge, client ID, date, duration, clinician. Body uses serif type and shows Presenting / Treatment goal / Plan sections. The treatment goal is highlighted green if pass-expected, red if fail-expected. "Skip note" button.

**AI evaluation card:** Result badge (Pass / Fail / N/A), Reasoning text, then "Do you agree?" with Agree (primary) / Disagree (secondary) buttons. Disagree opens a feedback textarea + "Refine rule" link back to Clarify, and resets streak to 0.

**Below:** "Label more examples" card with stronger CTA, 3 stat boxes (Pass / Fail / N/A label counts) and 3 buttons to mark current note. Recommended badge.

**Top status messages:** Initial → "Review the AI's evaluation below…" · Streak in progress → "N more agreements to activate" · Streak reset → warning + "Refine in Clarify" link · Passed → green check + "ready to activate"

---

### 5. Activate stage (`view.step = "activate"`)

**Purpose:** Final review + choose how to launch. Replaces a passive "Confirm" page.

**Layout:** Single column, max-width 920px.

**Sections in order:**
1. **Validation passed summary** — same definition card pattern as Clarify, with "v1 · {rule name}" in header
2. **Estimated impact** — 3 stat cards (Notes/week, Expected fails, Clinicians notified)
3. **Where should it run?** — two large surface toggles (Dashboard / LQA) with checkboxes, descriptions, compatibility chips. Inline error if neither is selected.
4. **When should it start?** — two equally-sized choice cards: "Activate now" (with play icon, recommended) and "Save and activate later" (with pause icon, sets status = Submitted)
5. **Acknowledgment row** — only appears if "Activate now" is selected. Saving as Submitted is NOT gated by it.

**Final CTA:** "Activate rule" (with power icon) or "Save as Submitted" depending on choice.

---

## Interactions & Behavior

- **Step navigation:** Linear forward (next step disabled until requirements met). Back is always allowed without losing state.
- **Auto-save:** Every change to draft persists in component state with "auto-saved N seconds ago" indicator
- **Side-panel actions:** All async actions confirm via modal (Disable, Re-enable, Duplicate, Adopt). Toasts confirm completion (bottom-right).
- **Library adopt:** Adopting copies the library rule into the org as a draft and opens it in Define stage with `adoptedFromLibrary: true` flag (shows a "from Library" chip on the row)
- **Edit existing rule:** Reopens the flow at requested step (`define`, `clarify`, or `validate`). For active rules, it's a true edit (not a duplicate-to-edit pattern).
- **Validation streak reset:** Disagreeing resets streak to 0 and surfaces a warning + a deep-link back to Clarify
- **Tweaks panel:** Listens for `__activate_edit_mode` / `__deactivate_edit_mode` postMessages from the host. When active, shows segmented controls for the counter style. Changes persist via `__edit_mode_set_keys`.

---

## State Management

Top-level state in `App` (`src/app.jsx`):

| Variable | Type | Purpose |
|---|---|---|
| `rules` | `Rule[]` | All rules (org + library, distinguished by `library: bool`) |
| `view` | `{name, step?}` | `"manage"` or `"flow"` with sub-step |
| `selectedRuleId` | `string \| null` | Open side panel target |
| `draft` | `Draft \| null` | Active draft being edited in the flow |
| `definition` | `{statement, pass, fail}` | Composed rule definition from Clarify |
| `toasts` | `Toast[]` | Bottom-right notifications |
| `tweaks` | `{validateCounter, clarifyLayout}` | Tweaks panel state |
| `adoptModal` | `{rule, mode} \| null` | Library adoption confirm modal |

**Rule data model** (see `src/data.jsx > ALL_RULES`):
```ts
{
  id, name, purpose,
  status: "draft" | "submitted" | "active" | "disabled",
  surfaces: ("dashboard" | "lqa")[],
  docType, programs[], priority: "Critical" | "High" | "Medium",
  validation: "passed" | "in_progress" | "not_started",
  validationCount, lastUpdated, author, version,
  weeklyRuns, weeklyFails,
  library: bool, owner,
  // library only:
  compatibility?: "full" | "partial" | "none",
  adoptions?: number,
  // org only, optional:
  adoptedFromLibrary?: bool,
  fields?, references?, clarify?: {answers},
}
```

**Org schema** (`ORG_SCHEMA`): `docTypes` (with note volume) + `fields` (with group, LQA scrape level, fill %).

---

## Design Tokens

Defined as CSS custom properties in `styles.css :root`. The visual identity is a calm clinical SaaS placeholder — replace teal with Eleos brand and re-evaluate the gray scale during implementation.

**Ink (text + border):**
```
--ink-900: #0B1220   primary text
--ink-800: #1A2336
--ink-700: #2B3550
--ink-500: #5B657D   secondary text
--ink-400: #7A8499
--ink-300: #A9B1C1   muted
--ink-200: #D4D9E2   borders strong
--ink-150: #E4E7EE   borders default
--ink-100: #EEF1F6   surface alt
--ink-50:  #F6F8FB   canvas
```

**Brand (placeholder teal — REPLACE):**
```
--brand-700: #0E6E6E
--brand-600: #0F8A8A
--brand-500: #17A5A5
--brand-100: #DCF1F1
--brand-50:  #EEF9F9
```

**Status:**
```
ok:    700 #0F7A42 / 500 #1FA363 / 100 #DCF2E5 / 50 #EEF8F2
warn:  700 #8A5A00 / 500 #B98205 / 100 #FBEBC5 / 50 #FEF7E5
err:   700 #A1231D / 500 #D13A32 / 100 #F8DAD7 / 50 #FCEEEC
info:  700 #1C4FB8 / 500 #3B73DC / 100 #DCE7FB / 50 #EEF3FD
purple:500 #7A5AF0 / 100 #E6E0FC / 50  #F3EFFE   (used for AI accents)
```

**Radii:** `xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20`

**Shadows:** `xs / sm / md / lg / xl` — most surfaces use `xs` or none. Drawer uses `xl`.

**Typography:**
- Sans: Inter (system fallback)
- Serif: Source Serif 4 — used for note bodies and the live definition statement
- Mono: JetBrains Mono / SF Mono — used for kbd hints
- Body: 14px / 1.5 with `font-feature-settings: "cv11", "ss01", "ss03"`
- Page H1: 22px, weight 600, letter-spacing -0.4px
- Section header H3: 15px, weight 600
- Card title H3: 15px, weight 600
- Drawer H2: 18px, weight 600
- Stat card numeral: 20px, weight 600, tabular-nums
- Streak counter: 28px, weight 700

**Spacing:** Custom values per component (no rigid 4/8 scale). Common: page padding 28/32, card body 20, section gap 24, button padding 8×14.

**Density principle (after the "calmer" pass):** Borders are thin `--ink-150`, shadows are absent or `xs`, color is reserved for emphasis (active state, pass/fail, destructive). Default state is grayscale.

---

## Assets

- **Icons:** Inline SVG (Feather-style, 24×24 viewBox, 1.75 stroke). All defined in `src/data.jsx > Icon` component. Names used: `plus, search, chevronDown/Right/Left, x, check, book, rules, dashboard, settings, info, alert, alertCircle, sparkle, refresh, history, copy, moreH/V, sliders, edit, power, send, thumbsUp/Down, paperclip, database, fileText, bell, help, arrowRight/Left/UpRight, eye, play, pause, plug, filter, upload, link, tag, users, activity`. Use the codebase's existing icon system (e.g., Lucide, Phosphor, custom set) — match shapes if possible.
- **Logo placeholder:** "e" in a teal gradient square. Replace with actual Eleos logo.
- **No raster images.** Everything is SVG or CSS.
- **Fonts:** Inter via rsms.me; Source Serif 4 via Google Fonts. Replace with Eleos-licensed fonts.

---

## Files

In this handoff folder:

- `Custom Rule Creation.html` — entrypoint, loads React + Babel + the JSX modules
- `Custom Rule Creation v1.html` — earlier iteration kept for reference (do NOT implement this version)
- `styles.css` — all CSS, including a "calmer pass" override block at the end
- `src/data.jsx` — Icon component, ORG_SCHEMA, ALL_RULES, SAMPLE_NOTES, RULE_HISTORY
- `src/chrome.jsx` — Sidebar, Topbar, StatusBadge, SurfacePill, Toast, Modal, Stepper
- `src/rule_management.jsx` — Rule list table, side panel, compatibility badge
- `src/form_clarify.jsx` — Define + Clarify stages, FieldsInPlay rail, composeDefinition()
- `src/validate_confirm.jsx` — Validate + Activate stages, AgreementCounter
- `src/app.jsx` — top-level App, routing, state, action handlers, Tweaks panel, modal orchestration

To run the prototype locally, open `Custom Rule Creation.html` in a browser via any static file server (Babel transforms JSX in-browser).

---

## Implementation Notes for the Developer

- **Don't ship the in-browser Babel setup.** Use whatever build pipeline Eleos already has (likely Vite/Next + TS).
- **Replace the placeholder data layer.** `ALL_RULES`, `SAMPLE_NOTES`, `ORG_SCHEMA`, `RULE_HISTORY` are static; wire to real APIs.
- **Re-skin to Eleos brand.** Strip the teal `--brand-*` tokens and substitute Eleos's design system. Type ramp and spacing should map to existing tokens; only adopt new tokens if Eleos has gaps.
- **Status state machine** (per PRD): Draft → Submitted → Active → Disabled. Submitted is gated on validation pass (3 agreements). Disabled is reversible.
- **Library adoption** copies the rule into org space; the original library rule is read-only.
- **Surfaces** (Dashboard / LQA) are toggleable post-activation from the side panel.
- **The Tweaks panel is a prototype-only affordance** — do not ship it. Pick one validation counter style for production (the `dots` variant is the recommended default).
- **Confirmation modals are non-negotiable** for Disable, Re-enable, Adopt, and library Duplicate per the simplified flow.
