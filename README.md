# GRIDFALL

A polished, local infrastructure crisis simulator inspired by Trinidad & Tobago. Explore how a damaged power plant can take down substations, hospitals, water facilities, and entire communities, then prioritize recovery with three repair crews.

**All assets, names, connections, populations, costs, scenarios, and the schematic are illustrative. This is not a real grid, live data source, geographic map, or emergency-planning tool.**

## Run locally

Requires Node.js 22.12+ (or a newer supported LTS) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

```sh
npm test         # Deterministic simulation tests
npm run build   # Strict TypeScript check and production build
npm run preview # Serve the production build locally
```

No backend, database, API key, external fonts, map service, or runtime network dependency. npm is needed for the initial dependency installation. The app does not persist state; reloading starts a fresh exercise.

## The exercise

1. Select **normal operation**, **tropical storm**, or **major hurricane**.
2. Click **Simulate Disaster**. Each run starts a fresh deterministic exercise with three available crews.
3. Click any SVG node, or focus it with the keyboard and press Enter or Space. Inspect its status, repair requirements, downstream residents, and clickable upstream dependencies.
4. Follow the impact-ranked repair order or choose your own strategy. Deploy crews from the inspector or restoration list.
5. Watch availability, affected residents, critical facilities, and the time-stamped incident log update immediately.
6. Use **Reset Simulation** to restore the baseline and all three crews.

Labels, zoom, event filters, navigation, and the simulation guide are functional. The layout adapts to mobile screens, the guide uses a native modal dialog, and animations respect reduced-motion preferences.

## Model and accounting

The fictional network contains 12 assets: 2 power plants, 3 substations, 2 hospitals, 2 water-treatment facilities, and 3 communities, with 13 directed dependencies.

- **Operational:** no physical damage and every upstream dependency is operational.
- **Physical failure (red):** directly damaged by the scenario; needs a repair.
- **Cascading outage (amber):** not physically damaged, but at least one upstream dependency is offline. Restores automatically when all dependencies recover.
- Communities require both power and water. Redundant power feeds, backup generators, repair durations, and capacity constraints are intentionally outside this workshop model.
- **Grid availability** is operational assets ÷ 12, rounded to the nearest integer percent. It is not a measure of generated power or energy capacity.
- **Affected population** sums offline communities once: west 80,000, central 120,000, east 60,000. Shared dependencies never double-count residents.
- **Critical facilities offline** counts the 2 hospitals and 2 water facilities. Criticality is separately modeled on a five-point scale for each asset.
- **Downstream residents** in the inspector is the total community population reachable from that asset, including itself. It describes network reach, not an additive service-area estimate or necessarily the immediate gain from a repair.
- Physical repairs restore immediately and cost 1 or 2 crews plus the displayed illustrative TT-dollar amount. Crews remain committed until reset or another scenario. A repaired asset can remain isolated if its own upstream source is still offline.
- Each repair advances the exercise clock by 5 minutes. Log entries are spaced by 15 seconds. These are deterministic exercise timestamps, not wall-clock time or modeled repair durations.

### Expected checkpoints

| State | Online assets | Availability | Affected residents | Critical offline | Crews available |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline | 12 | 100% | 0 | 0 | 3 |
| Tropical storm | 5 | 42% | 260,000 | 3 | 3 |
| Storm, repair Caroni Interchange | 9 | 75% | 60,000 | 2 | 2 |
| Storm, repair all 3 damaged assets | 12 | 100% | 0 | 0 | 0 |
| Major hurricane | 1 | 8% | 260,000 | 4 | 3 |

The storm can be completely recovered with three crews (TT$148,000 total). The hurricane deliberately cannot: damage requires four crews. Consider whether restoring eastern critical services first or western residential services first produces a better outcome under your exercise priorities.

### Suggested repair score

For each damaged node, simulate its repair and calculate:

```text
immediate impact =
  residents restored
  + 75,000 × critical facilities restored
  + 2,500 × assets restored

potential impact =
  distinct downstream residents
  + 75,000 × downstream critical facilities

score = (immediate impact + 0.02 × potential impact) / crews required
```

The small potential-impact term helps order repairs that are blocked by other damage. Suggestions recalculate after every repair. This transparent heuristic prioritizes critical services and population benefit per crew; it is not a global optimization algorithm or emergency-management recommendation. Unaffordable repairs remain visible but disabled.

## Project structure

```text
src/
  simulation/
    types.ts       Typed assets, scenarios, state, and events
    data.ts        Small illustrative network and disaster definitions
    engine.ts      Pure dependency, impact, ranking, and restoration logic
    engine.test.ts Tests for cascades, accounting, and recovery
  components/      Reusable React interface components
  App.tsx          Exercise state and component composition
  styles.css       Tailwind CSS and command-center styling
```

## One-hour workshop

- **0–10 min:** run the app and explore the network.
- **10–25 min:** simulate the storm; trace a community outage to its source.
- **25–40 min:** compare hurricane recovery strategies with three crews.
- **40–50 min:** change a dependency, repair cost, or scenario in `data.ts`.
- **50–60 min:** update the expected results and run the tests.

The engine is deliberately separate from the interface, so students can understand and modify the model without a backend or mapping library.
