# ☕ Crackle & Pour

A Papa's Pizzeria-style time-management game for mobile web: you own a specialty
cafe **and roastery**, and you play through your day — greeting customers,
roasting beans, pulling shots, steaming milk, and building drinks for tips.

**Zero dependencies, zero build step.** Plain HTML/CSS/JS with all art drawn as
inline SVG and all sound synthesized with WebAudio.

## Play it

- Open `index.html` directly in a browser, **or**
- Serve it: `python3 -m http.server 8000` → `http://localhost:8000`, **or**
- Host the repo on GitHub Pages (works as-is).

Best played on a phone in portrait. Mouse works fine on desktop.

## How a day goes

1. **Order** — customers line up with patience meters. Tap them, take their order;
   tickets land on the ticket strip at the bottom.
2. **Roast** — the twist: drinks consume roasted beans from shared inventory.
   Load greens, pick Light/Medium/Dark, and hit **DROP!** when the marker is in
   the band — listen for first crack. Burnt batches go in the bin.
3. **Brew** — grind (release in the gold window), then pull the espresso shot to
   the line — or do a two-pour pour-over with a bloom rest.
4. **Milk** — hold and drag the pitcher: near the surface builds foam, deep
   builds heat. Release inside both target bands.
5. **Serve** — assemble the cup: pour your shot and milk, count syrup pumps,
   hold the whipped cream, tap the dust shaker on the pulse. Then SERVE.

Drinks are scored on craftsmanship, roast quality, and how long the customer
waited. Stars decide tips. Earnings buy upgrades (wider timing windows, calmer
customers, a smart register), and each day unlocks new recipes — latte,
pour-over, cappuccino, mocha and more — with more customers and faster tempers.

Progress saves automatically between days (`localStorage`).

## Code layout

| Path | What it is |
|---|---|
| `js/data.js` | All recipes, characters, prices, unlock schedule, balance constants |
| `js/svg.js` | Parameterized SVG art (customers, machines, cups, icons) |
| `js/audio.js` | Synthesized sound effects |
| `js/state.js`, `js/save.js` | Central state, event bus, versioned saves |
| `js/customers.js`, `js/tickets.js` | Arrivals, patience, ticket lifecycle, scoring |
| `js/st-*.js` | One module per station minigame |
| `js/shop.js`, `js/main.js` | Summary/shop screens, game loop, day flow |

Scripts load as plain `<script>` tags onto a shared `CG` namespace so the game
also runs from `file://`.
