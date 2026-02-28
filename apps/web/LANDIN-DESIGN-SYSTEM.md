# Landin Framer Template - Design System Reference

> Extracted from https://landin.framer.website/ on 2026-02-23
> This document serves as the complete reference to replicate the Landin design system
> for the TurnoLink landing page.

---

## 1. COLOR PALETTE

### Primary Colors
| Token | Value | RGB | Usage |
|-------|-------|-----|-------|
| `primary` | `#0055FF` | `rgb(0, 85, 255)` | Botones CTA, glows, acentos, highlights |
| `primary-50` | `#0055FF80` | `rgba(0, 85, 255, 0.5)` | Glow shadows |
| `primary-25` | `#0055FF40` | `rgba(0, 85, 255, 0.25)` | Glow secundario |
| `primary-15` | `#0055FE26` | `rgba(0, 85, 254, 0.15)` | Gradient cards |
| `primary-12` | `#0055FF1F` | `rgba(0, 85, 255, 0.12)` | Ring border |

### Background / Surfaces
| Token | Value | RGB | Usage |
|-------|-------|-----|-------|
| `bg-base` | `#000000` | `rgb(0, 0, 0)` | Fondo principal de la pagina |
| `surface-1` | `#080808` | `rgb(8, 8, 8)` | Cards principales, secciones |
| `surface-2` | `#0D0D0D` | `rgb(13, 13, 13)` | Cards internas, flotantes |
| `surface-3` | `#131313` | `rgb(19, 19, 19)` | Overlays, tags, FAQ cerrado |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `text-primary` | `rgb(255, 255, 255)` | Titulos, texto principal |
| `text-secondary` | `rgba(255, 255, 255, 0.6)` | Subtitulos, H2 secundarios, descripciones |
| `text-muted` | `rgba(255, 255, 255, 0.5)` | Texto terciario, placeholders |
| `text-dark` | `rgb(19, 19, 19)` | Texto sobre fondo blanco (botones) |

### UI Colors
| Token | Value | Usage |
|-------|-------|-------|
| `white-solid` | `#EFEEEC` / `rgb(239, 238, 236)` | Boton secundario |
| `border-subtle` | `rgba(255, 255, 255, 0.1)` | Bordes de cards, separadores |
| `glass-bg` | `rgba(255, 255, 255, 0.15)` | Boton ghost/glass |
| `glass-light` | `rgba(255, 255, 255, 0.2)` | Glass mas visible |
| `gray-mid` | `rgb(153, 153, 153)` | Gradientes de texto |

---

## 2. TYPOGRAPHY

### Font Family
```css
font-family: "DM Sans", "DM Sans Placeholder", sans-serif;
```
> Google Fonts: https://fonts.google.com/specimen/DM+Sans

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| **H1** | `56px` | `400` | `55px` | `-3.4px` | `white` |
| **H2** (primary) | `35px` | `400` | `32px` | `-2px` | `white` |
| **H2** (secondary) | `35px` | `400` | `32px` | `-2px` | `rgba(255,255,255,0.6)` |
| **H4** | `18px` | `500` | `26px` | `-0.5px` | `white` |
| **Body** | `16px` | `400` | `26px` | `-0.2px` | `white` |
| **Body (muted)** | `16px` | `400` | `26px` | `-0.2px` | `rgba(255,255,255,0.6)` |
| **Body (bold)** | `16px` | `500-600` | `26px` | `-0.5px` | `white` |
| **Label/Badge** | `12px` | `700` | `10px` | `-0.5px` | `white` |
| **Nav links** | `16px` | `500` | `26px` | `-0.5px` | `white` |

### Typography Patterns
- H2 titles often split into 2 lines: first line `white`, second line `rgba(255,255,255,0.6)`
- Negative letter-spacing across ALL text (tight typography)
- Section subtitles always `rgba(255,255,255,0.6)` weight `400`

---

## 3. BUTTONS

### Variant 1: Primary CTA (Blue Glow)
```css
background-color: rgb(0, 85, 255);
color: white;
border-radius: 10px;
padding: 10px 18px;
font-size: 12px; /* Note: this is Framer mobile, use 14-16px for desktop */
font-weight: 500;
border: none;
transition: all;
box-shadow:
  rgba(0, 85, 255, 0.5) 0px 8px 40px 0px,
  rgba(255, 255, 255, 0) 0px 0px 10px 1px inset,
  rgba(0, 85, 255, 0.12) 0px 0px 0px 1px;
```

### Variant 2: Secondary (White/Light)
```css
background-color: rgb(239, 238, 236);
color: rgb(19, 19, 19);
border-radius: 10px;
padding: 10px 18px;
font-weight: 500;
border: none;
transition: all;
```

### Variant 3: Ghost / Glass
```css
background-color: rgba(255, 255, 255, 0.15);
color: white;
border-radius: 10px;
padding: 10px 18px;
backdrop-filter: blur(2.5px);
border: none;
transition: all;
```

### Variant 4: White Pill (small)
```css
background-color: white;
color: rgb(19, 19, 19);
border-radius: 10px;
padding: 6px 14px;
font-weight: 500;
backdrop-filter: blur(2.5px);
```

### Variant 5: Tag/Chip (benefits section)
```css
background: transparent;
color: rgba(255, 255, 255, 0.6);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 100px; /* full pill */
padding: 6px 14px;
font-size: 14px;
```

---

## 4. GLOW EFFECTS (Signature del Diseno)

### Primary Button Glow
```css
box-shadow:
  rgba(0, 85, 255, 0.5) 0px 8px 40px 0px,
  rgba(255, 255, 255, 0) 0px 0px 10px 1px inset,
  rgba(0, 85, 255, 0.12) 0px 0px 0px 1px;
```

### Card Section Glow
```css
box-shadow:
  rgba(0, 85, 255, 0.25) 0px 5px 25px 0px,
  rgba(255, 255, 255, 0.08) 0px 10px 10px -1px inset;
```

### Subtle Inner Glow
```css
box-shadow: rgba(0, 85, 255, 0.1) 0px 10px 10px -1px inset;
```

### Floating Card Glow
```css
box-shadow: rgba(0, 85, 255, 0.35) 2px 4px 24px 0px;
```

### Dark Card Shadow
```css
box-shadow: rgba(0, 0, 0, 0.35) 2px 4px 24px 10px;
```

---

## 5. GRADIENTS

### Card Feature Background (base + hover)
```css
background: linear-gradient(0deg, rgba(0, 85, 254, 0.15) 0%, rgba(97, 97, 97, 0.09) 100%);
```

### Glass Horizontal Line (decorative divider)
```css
background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
```

### Blue Glow Line (section divider accent)
```css
background: linear-gradient(90deg, rgba(0,85,255,0) 0%, rgb(0,85,255) 50%, rgba(0,85,255,0) 100%);
```

### Dark Image Overlay
```css
background: linear-gradient(rgba(19,19,19,0.5) 6.6%, rgba(0,0,0,0.3) 100%);
```

### Fade to Black (bottom of images)
```css
background: linear-gradient(rgba(0,0,0,0) 0%, rgb(0,0,0) 100%);
```

### Text Gradient (hero titles, subtle white-to-gray)
```css
background: linear-gradient(90deg, rgb(255,255,255) 0%, rgba(153,153,153,0) 410%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Card Glass Shimmer
```css
background: linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.02) 100%);
```

### Card Inner Glow Gradient
```css
background: linear-gradient(rgba(255,255,255,0.07) -100%, rgba(255,255,255,0.05) 100%);
```

---

## 6. CARDS

### Main Section Card (outer wrapper)
```css
background: #080808;
border-radius: 30px;
padding: 10px;
backdrop-filter: blur(2px);
overflow: visible;
```

### Inner Content Card
```css
background: #080808;
border-radius: 12px;
padding: 26px 16px 16px;
overflow: hidden;
```

### Floating Info Card
```css
background: #0D0D0D;
border-radius: 12px;
padding: 12px 12px 12px 16px;
backdrop-filter: blur(2px);
box-shadow: rgba(0, 0, 0, 0.35) 2px 4px 24px 10px;
```

### Feature Card (grid de 6 features)
```css
background: linear-gradient(0deg, rgba(0,85,254,0.15) 0%, rgba(97,97,97,0.09) 100%);
border-radius: 20px;
padding: 30px;
border-top: 2px solid; /* blue glow gradient line on top */
transition: all;
```

### Pricing Card
```css
background: transparent; /* relies on parent surface */
border-radius: 20px;
padding: 30px;
/* Has inner blue glow gradient on top border */
```

### Testimonial Card
```css
border-radius: 20px;
padding: 30px;
/* blue top glow line */
/* Contains: avatar, 5 stars, quote text, name/role */
```

### FAQ Accordion Item
```css
/* Closed state */
background: #131313;
border-radius: 20px;
cursor: pointer;
overflow: hidden;
padding: ~20px 30px;

/* Open state */
background: white;
color: black;
/* + icon rotates to x icon */
/* Content expands with height animation */
```

---

## 7. IMAGES

### Standard Image Style
```css
border-radius: 19-23px; /* matches card inner radius */
object-fit: cover;
width: 100%;
```

### Portfolio Image (hover effect)
```css
/* Normal */
border-radius: 20px;
overflow: hidden;

/* Hover - "View Now" button appears centered */
/* Image slightly scales up */
```

### Avatar (testimonials)
```css
border-radius: 100%;
width: ~60px;
height: ~60px;
object-fit: cover;
```

---

## 8. ANIMATIONS & BEHAVIORS

### 8.1 Scroll-Triggered Word-by-Word Reveal
The most distinctive animation. Each word in H2 headings appears individually as you scroll.
```
Initial state:  opacity: 0.001, translateY(10px), blur(10px)
Final state:    opacity: 1, translateY(0), blur(0)
Trigger:        Scroll into viewport
Stagger:        Each word has slight delay
Engine:         Framer Motion (IntersectionObserver equivalent)
```

### 8.2 Logo Marquee (Infinite Horizontal Scroll)
```
Container:      overflow: hidden
Inner:          display: flex, gap: 40px
Animation:      translateX continuous loop
Items:          16 items (duplicated for seamless loop)
Direction:      Left-to-right continuous
```

### 8.3 Case Studies Carousel (Horizontal Drag)
```
Active card:    opacity: 1, scale(1)
Inactive card:  opacity: 0.8, scale(0.9)
Transition:     transform-origin: 100% 50%
Interaction:    cursor: grab / grabbing
Navigation:     Pagination dots below
```

### 8.4 FAQ Accordion
```
Trigger:        Click on item
Open:           Height animates from 0 to auto
                Background: dark -> white
                Icon: + rotates to x
                Text color: white -> dark
Close:          Reverse of above
Only one open:  Previous item closes when new opens
```

### 8.5 Testimonial Horizontal Scroll
```
Cards in row with horizontal scrolling
Infinite loop with duplicated items
Auto-scroll with drag interaction
```

### 8.6 Navbar
```css
position: sticky/fixed;
backdrop-filter: blur(20px);
background: transparent;
z-index: high;
/* Transparent over hero, blur effect on scroll */
```

### 8.7 Portfolio Card Hover
```
Normal:   Image visible, title + year at bottom
Hover:    "View Now" white pill button appears centered
          Image may slightly zoom
          Smooth transition
```

### 8.8 Blue Glow Line Animation
```
Element with primary blue gradient line
Initial:  opacity: 0, scale(0.3)
Animate:  opacity: 1, scale(1) on scroll
Creates a "reveal" effect for section dividers
```

### 8.9 Section Fade-In
```
Sections fade in + slight translateY as they enter viewport
Standard parallax-lite feel
```

---

## 9. LAYOUT & SPACING

### Page Structure
- Total page height: ~21,191px
- Max content width: ~1200px (centered)
- Section vertical padding: 80-120px
- Card inner gap: 10-20px

### Breakpoints (Framer)
```css
@media (min-width: 1440px)  { /* Desktop full */ }
@media (min-width: 1200px) and (max-width: 1439px) { /* Desktop */ }
@media (min-width: 810px) and (max-width: 1199px) { /* Tablet */ }
@media (max-width: 809px) { /* Mobile */ }
```

### Grid Patterns
- Features: 2 columns x 3 rows (6 items)
- Portfolio: 3 columns
- Pricing: 2 columns (Basic + Premium)
- Testimonials: Horizontal scroll (6 cards)
- Benefits bento: 2-column asymmetric grid

---

## 10. SECTION STRUCTURE (Top to Bottom)

1. **Navbar** - Sticky, glass blur, logo left, links center, CTA right
2. **Hero** - Tag "NEW" + H1 (2 lines) + subtitle + 2 CTA buttons + logo marquee
3. **About** - Left: image (rounded), Right: tag + H2 + description + stats + stars + CTA
4. **Results** - Centered tag + H2 + subtitle + CTA + case studies carousel
5. **How We Work** - Left: tag + H2 + subtitle, Right: 3 stage cards (Kickoff/Execution/Handoff) + image
6. **Features** - Tag + H2 + subtitle + CTA + image + 2x3 grid of feature cards
7. **Benefits** - Tag + H2 + tag pills row + bento grid (4 cards with images)
8. **Portfolio** - Tag + H2 + subtitle + CTA + 3 project cards
9. **Services** - Image + tag + H2 + subtitle + 3 service/pricing cards
10. **Trusted Partner** - Tag + H2 + subtitle + CTA + testimonial carousel
11. **Pricing** - Tag + H2 + subtitle + 2 pricing plan cards (Basic $99 / Premium $2,599)
12. **Testimonials** - Tag + H2 + subtitle + logos + CTA + testimonial cards grid
13. **FAQ** - Tag + H2 + subtitle + 6 accordion items
14. **CTA Final** - Tag + H2 + description + CTA button
15. **Footer** - Logo + tagline + email subscribe + nav links + social links + copyright

---

## 11. COMMON UI PATTERNS

### Section Header Pattern (repeated 12+ times)
```
[Tag pill] "Section Name"      <- small pill with dot indicator
[H2 line 1] "Main Title"       <- white, 35px
[H2 line 2] "Subtitle Line"    <- white/60%, 35px
[Description paragraph]         <- muted text, 16px
[Optional CTA button]
```

### Tag/Pill Indicator
```css
display: inline-flex;
align-items: center;
gap: 8px;
padding: 6px 14px;
border-radius: 100px;
background: rgba(255, 255, 255, 0.1);
/* Blue dot before text */
.dot {
  width: 6px;
  height: 6px;
  border-radius: 100%;
  background: rgb(0, 85, 255);
}
```

### Stat Badge (checkmark + text)
```
[Blue checkmark circle] "From $0 to $500,000 in revenue."
Uses blue check icon with white check, followed by text
```

### Blue Line Divider (inside cards)
```css
width: ~40%;
height: 2px;
background: linear-gradient(90deg, rgba(0,85,255,0) 0%, rgb(0,85,255) 50%, rgba(0,85,255,0) 100%);
margin: 16px 0;
```

### Star Rating
```
5 gold/yellow star icons in a row
Used in testimonials and about section
```

---

## 12. HOVER & TRANSITION EFFECTS

### All Interactive Elements
```css
transition: all; /* Framer default - covers bg, shadow, transform, opacity */
```

### Feature Card Hover
```
Border-top glow intensifies
Slight background shift
Arrow icon may appear/animate
```

### Button Hover (Primary CTA)
```
Glow intensifies (box-shadow increases)
Slight scale up or brightness increase
Inner white inset glow appears
```

### Nav Link Hover
```
Opacity/color change
Possible underline animation
```

### Portfolio Card Hover
```
"View Now" button fades in at center
Image may zoom slightly
Overlay darkens
```

---

## 13. SPECIAL ELEMENTS

### "NEW" / "PRO" Badge
```css
display: inline-block;
background: rgb(0, 85, 255); /* blue for PRO */
/* or background: #131313; for NEW */
color: white;
padding: 4px 10px;
border-radius: 6px;
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
```

### Newsletter Input (Footer)
```css
/* Container */
display: flex;
background: #080808;
border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.1);
padding: 6px;

/* Input */
background: transparent;
color: white;
border: none;
padding: 10px 16px;
flex: 1;
placeholder-color: rgba(255, 255, 255, 0.5);

/* Button */
background: rgb(0, 85, 255);
color: white;
border-radius: 10px;
padding: 10px 18px;
/* Same glow as primary CTA */
```

### Pagination Dots (Carousels)
```css
.dot {
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background: rgba(255, 255, 255, 0.3);
}
.dot.active {
  background: white;
  width: 24px; /* elongated active dot */
  border-radius: 4px;
}
```

---

## NOTES FOR IMPLEMENTATION

1. **Font**: Install "DM Sans" from Google Fonts (weights: 400, 500, 600, 700)
2. **Framer Motion**: Use `framer-motion` for scroll-triggered word reveals and carousels
3. **Tailwind**: All values map cleanly to Tailwind utilities
4. **Dark-only**: This is a dark theme design, no light mode needed for landing
5. **Responsive**: Mobile-first, but the design shines on desktop (1200px+)
6. **Performance**: Use CSS animations where possible, Framer Motion only for complex interactions
7. **The blue glow is THE signature**: Apply it consistently to CTAs, section borders, and card accents
