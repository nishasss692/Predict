# Bengaluru Civic Brain — Frontend

AI-powered civic root-cause detection and decision support. MVP scope is urban
**waterlogging and stormwater drainage** problems.

This repository is **Person 3's** scope: frontend, dashboard, map visualisation,
user experience, the visual explanation layer and frontend polish.

---

## The product story the interface has to tell

```
Civic signals
  → Connected incidents
  → Incident cluster
  → Supporting evidence
  → Possible root cause
  → Confidence
  → Priority
  → Recommended action
```

Every screen is built so a supervisor can follow that chain without being told
about it. The chain is rendered literally at the top of the page, and each
stage downstream has to earn its place by showing the evidence that produced it.

### Non-negotiable rules encoded in the UI

| Rule | How it is enforced |
| --- | --- |
| Confidence is not certainty | `ConfidenceTag` always carries a band label and a glyph; `interpretation` text states what is *not* established |
| No colour-only information | Every severity tag pairs a colour with a glyph (`!!`, `!`, `~`, `-`) and a word |
| Every number has context | `Metric` makes `label`, `value` and `context` all required |
| Recommendations are traceable | Recommendations carry `linkedEvidenceIds` back to specific evidence rows |
| Alternatives stay visible | `rootCause.alternativesConsidered` is first-class, not hidden |
| Data is honest | A persistent `SYN` badge and a footer provenance note on every screen |

---

## Current state: Step 1 — foundation

Delivered and verified:

- **Design tokens** — dark navy/near-black substrate, cyan/blue operational
  accents, violet reserved for analytical surfaces, red/orange for high
  priority, teal for healthy signals. Defined once in `src/styles/index.css`.
- **API service abstraction** — components never import `fetch`. They import
  `civicApi` from `src/api`, which resolves through exactly one transport.
  Switching to FastAPI is an env change.
- **Mock dataset** — a full synthetic scenario: rainfall burst → drain level
  anomaly → four citizen reports → sewage overflow → traffic collapse → cluster
  → root-cause candidate → confidence → priority → recommendation. Three
  clusters at different confidence levels, including one deliberately weak.
- **Reasoning chain component** — the 8-step narrative split into
  Detect / Explain / Decide.
- **Situation band** — the 5-second read: how many situations, how bad, how
  many people affected.
- **Loading / error / empty states** — all three implemented and verified in a
  real browser.

Not built yet, on purpose: map, cluster list, cluster detail, evidence ledger,
timeline, recommendation panel.

---

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
npm run lint       # oxlint
```

## Switching to the real backend

```bash
cp .env.example .env
# set VITE_API_MODE=live and VITE_API_BASE_URL
```

The live service must return the shapes described by `src/api/mockAdapter.js`:
`GET /scenario`, `GET /overview`, `GET /clusters`, `GET /clusters/:id`,
`GET /assets`, `GET /signals`, `GET /incidents`.

---

## Architecture

```
src/
  api/                  the only data-access boundary
    index.js            civicApi facade + transport selection
    httpClient.js       fetch wrapper: timeout, abort, typed errors
    mockAdapter.js      serves src/api/mock/data/*.json with simulated latency
    mock/data/*.json    the synthetic scenario
  components/
    layout/             AppShell (skip link, frame, footer), AppHeader
    system/             BrandMark, ReasoningChain, SituationBar
    ui/                 Panel, Tag, Metric, DataState  (primitives, no domain logic)
  hooks/useResource.js  async state: loading / error / empty / refresh
  lib/
    scale.js            priority, confidence, signal-state vocabulary
    format.js           all number, time and distance formatting
    cn.js               class-name joiner
```

Rules that hold as the app grows:

1. A component never calls `fetch`, `axios` or reads a fixture file.
2. A component never formats a raw number — it calls `lib/format.js`.
3. A component never invents a severity label — it reads `lib/scale.js`.
4. `ui/` primitives carry no domain knowledge; `system/` and `layout/` do.

---

## Data provenance

Every figure in `src/api/mock/data/*.json` is fabricated. Locality names and
approximate coordinates are real so the map reads plausibly, but **no
government, sensor-vendor or citizen-reporting system data is represented**.
The interface states this on screen rather than only in this file.