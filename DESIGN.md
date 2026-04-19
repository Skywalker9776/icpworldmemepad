# ICPWorldMemepad — Design Brief

## Aesthetic Direction
Quantum-inspired, emotionally stimulating memecoin launchpad. Obsidian black + crimson red + dark gold + deep purple. FOMO-inducing cinematic effects, holographic shimmer, animated gradients, pulsing glows. Never-before-seen in crypto.

## Primary Palette
| Color | OKLCH | Intent |
|-------|------|--------|
| Background | `0.08 0 0` | Deep obsidian, zero distraction |
| Dark Gold | `0.65 0.15 70` | Primary CTA, warmth, trust, FOMO |
| Crimson Red | `0.55 0.25 25` | Secondary highlight, emotion, urgency |
| Deep Purple | `0.45 0.18 310` | Accent, mystique, sophistication |
| Foreground | `0.92 0.02 70` | Warm near-white text for contrast |

## Typography
| Role | Font | Weight | Use |
|------|------|--------|-----|
| Display | Space Grotesk | 700 | Headings, CTAs, logo-adjacent text |
| Body | DM Sans | 400 | All running text, UI labels, copy |
| Mono | Geist Mono | 500 | Code, numbers, technical details |

## Structural Zones
| Zone | Background | Border | Intent |
|------|------------|--------|--------|
| Header/Nav | `0.12 0 0` obsidian | `0.18 0.02 70` warm | Login/signup at top-center, always visible |
| Hero/Featured | Radial gradient: gold→red→purple | Glowing holographic | FOMO-maximizing cinematic entry |
| Content Sections | `0.12 0 0` cards, elevation | Subtle warm gold line | Distinct depth, no flat sameness |
| Interactive (Buttons) | Gradient gold→red | Blazing glow shadow | Plasma-like visual feedback |
| Footer | `0.16 0 0` muted | `0.18 0.02 70` border-top | Low visual weight, info-only |

## Motion & Effects
- **Entrance:** Fade + scale, 300ms, ease-out
- **Hover:** Blazing glow intensifies, shadow expands, text warm-glows
- **Particles:** Continuous slow drift of red/gold/purple dots, 0.2 opacity
- **Holographic scan:** Shimmer overlay sweeps across cards, 5s loop, FOMO pulse
- **Pulsing gradients:** Button glows cycle gold→red→gold, 2.5s, infinite
- **Parallax cards:** 4D meme cards shift perspective on scroll/hover

## Shape Language
- Buttons & CTAs: `rounded-lg` (12px) with sharp glow borders
- Cards: `rounded-md` (8px) with inset/outer holographic shimmer
- Input fields: `rounded-sm` (4px), minimal radius for focus
- Borders: 1-2px warm gold on dark, 4px blazing glow on hover

## Constraints
- Never use raw hex or HSL in components — always consume OKLCH via CSS custom properties
- No transparency-based contrast — tune OKLCH L/C instead
- Login options: Always top-center, always bright/highlighted, never buried
- Animations: Tied to meaningful interactions, never random
- Differentiation: Quantum glow effects, holographic overlays, pulsing FOMO cues
- Anti-pattern: Flat backgrounds, generic blue buttons, timid palettes

## Signature Detail
**Quantum Holographic Shimmer:** Every card and CTA has a subtle-to-intense moving gradient overlay that shifts gold→red→purple, reinforcing the futuristic, emotionally charged aesthetic. This detail alone should make ICPWorldMemepad visually distinct in the crypto space.

## Component Patterns
- Primary action: `.btn-blazing` (gold→red gradient, plasma glow, DM Sans bold)
- Secondary action: Gold outline, warm text, glow on hover
- 4D Meme Cards: Parallax depth, holographic shimmer, rarity tier glow
- Safety badges: Purple glow for trust indicators, red for warnings
- Charts: Gold for positive trends, red for volume/attention, purple for AI scores
