# LIFELANE Dashboard Design Direction

## Three stylistic approaches

### Theme Name: Signal Noir
Very dark command-center interface with electric cyan telemetry, amber warnings, and restrained glass depth. Feels operational, precise, and cinematic without becoming cyberpunk.
Probability: 0.07

### Theme Name: Civic Blueprint
A graphite and ivory urban-planning console inspired by engineering drawings, transit maps, and municipal operations rooms. Calm, authoritative, and highly legible.
Probability: 0.03

### Theme Name: Kinetic Meridian
A midnight-blue interface with warm copper highlights, layered route geometry, and editorial typography. Feels premium and human-centered while preserving emergency urgency.
Probability: 0.08

## Chosen Approach: Signal Noir

### Design Movement
Contemporary information design with industrial control-room references and restrained neo-futurist materiality.

### Core Principles
1. **Operational clarity first:** every accent color communicates system state, priority, or live movement.
2. **Layered depth:** panels float over a dark control surface with fine borders, soft shadows, and subtle grid texture.
3. **Asymmetric command layout:** a fixed rail, wide map stage, and stacked intelligence panels create a deliberate left-to-right operational scan.
4. **Motion with purpose:** animation communicates telemetry, not decoration—route progress, pulse, signal sequencing, and toast events stay short and legible.

### Color Philosophy
The base is near-black navy-charcoal to reduce glare and make live data luminous. Cyan is reserved for telemetry and navigation, green only validates a live corridor, and coral/amber are reserved for emergency priority and interventions. No decorative rainbow effects or generic purple gradients.

### Layout Paradigm
A persistent command rail anchors the left edge while the content area uses a responsive 12-column operational canvas: KPI strip, dominant map stage, and right-side incident intelligence stack. On small screens the rail collapses into a compact top bar and panels become a vertical operations feed.

### Signature Elements
- A fine-grain telemetry grid over map surfaces.
- Thin cyan route lines with a moving luminous ambulance beacon.
- Numbered junction chips and signal-state pills that visually behave like live instrumentation.

### Interaction Philosophy
Controls feel like operational actions: immediate, deliberate, and reversible. Hover states brighten the affected module; action buttons provide a visible pressed response; placeholder navigation shows a concise coming-soon toast rather than dead-ending.

### Animation
Use 180–280ms ease-out transitions for surfaces and buttons. Keep the ambulance beacon moving along a route loop, use a 2.5s status pulse for live markers, and sequence signal states with 1.2s intervals. Respect prefers-reduced-motion by disabling nonessential looping motion.

### Typography System
Use Space Grotesk for display labels and dense operational headings; use IBM Plex Mono for timestamps, IDs, status labels, and numeric telemetry. Hierarchy: 11px uppercase mono for metadata, 13–14px body labels, 18–24px card metrics, 30px page title.

### Brand Essence
LIFELANE is a live emergency-traffic command surface for city operators who need to create safer, faster ambulance corridors under pressure. Personality: **precise, vigilant, humane**.

### Brand Voice
Headlines are concise and operational. CTAs use decisive verbs; microcopy explains what is happening without hype.
- Example headline: **Corridor orchestration is live.**
- Example microcopy: **Junction 02 is staging for the next ETA window.**

### Wordmark & Logo
Use a compact geometric mark built from two crossing lane strokes and a central forward arrow, paired with a typographic LIFELANE wordmark in tracked Space Grotesk. The mark should read as both a road junction and an emergency beacon.

### Signature Brand Color
**Signal Cyan — #48D7E8**. It is bright enough to carry live telemetry on graphite surfaces while remaining distinct from corridor green and emergency coral.

## Style Decisions
- Use a dark, high-contrast command-center canvas with no purple gradient background.
- Use green only for confirmed active corridors and amber/coral only for emergency intervention states.
- Keep motion restrained, purposeful, and reduced under prefers-reduced-motion.
- Make the map the visual anchor, with the right rail acting as an intelligence stack rather than a generic card grid.
