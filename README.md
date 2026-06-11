# fika — specialty cafe & roastery

A time-management game for mobile web in the spirit of Papa's Pizzeria, set in a
Nordic specialty coffee bar. You own the place: roast single-origin beans, dial
in espresso, pour V60s with a gooseneck kettle, steam milk, and free-pour latte
art — drink by drink through your day.

**Zero dependencies, zero build step.** Plain HTML/CSS/JS; all art is soft-shaded
inline SVG and all sound is synthesized WebAudio.

## Play it

- **Live**: https://yali444.github.io/cafe-game/ (deployed from the `gh-pages` branch — push there to update)
- Or open `index.html` directly, or serve with `python3 -m http.server 8000`

Best on a phone in portrait. On iPhone, Safari → Share → **Add to Home Screen**
for a fullscreen, app-like experience. Mouse works fine on desktop.

## The day

1. **The Counter** — guests arrive with patience meters and order by origin and
   brew method ("The Ethiopia as a V60 — something floral").
2. **Roastery** — tap a bag of greens (Colombia Huila, Ethiopia Yirgacheffe,
   Kenya Nyeri AA), ride the roast curve, and drop inside that origin's profile
   window. First crack is your cue. Batches stock the brew bar.
3. **Brew Bar** — hands-on, the equipment is the interface:
   - *Espresso*: drag the grind dial into the sweet spot, lock the portafilter
     into the group head, tap to cut the shot at the line.
   - *V60*: pick up the gooseneck kettle and pour — bloom to the first line,
     wait, then two slow pours.
   - *AeroPress*: steep on the ring, then a steady press.
   - *Batch*: keep the house carafe stocked.
4. **Milk Bar** — hold the pitcher under the wand; raise it to stretch foam,
   lower it to heat. Release inside both texture bands.
5. **The Pass** — pour the drink together, and on flat whites and lattes
   free-pour the art: wiggle as you pour for a heart, tulip, or rosetta.

Drinks are scored on roast quality, brew execution, milk texture, the pour, and
the guest's wait. Stars decide tips; earnings buy equipment (wider dial windows,
steadier kettle, calmer guests). New origins and brew methods unlock day by day.
Progress saves automatically between days.

## Code layout

| Path | What it is |
|---|---|
| `js/data.js` | Origins, menu, upgrades, unlock schedule, balance |
| `js/svg.js` | Soft-shaded SVG scenes, equipment, characters, drink art |
| `js/st-*.js` | One module per station (counter, roastery, brew, milk, pass) |
| `js/customers.js`, `js/tickets.js` | Guests, patience, tickets, scoring |
| `js/state.js`, `js/save.js`, `js/audio.js` | State + event bus, versioned saves, synth SFX |
| `js/ui.js`, `js/shop.js`, `js/main.js` | Screens, summary/shop, game loop |

Scripts load as plain `<script>` tags onto a shared `CG` namespace, so the game
also runs straight from `file://`.
