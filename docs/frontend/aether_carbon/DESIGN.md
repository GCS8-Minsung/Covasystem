# Design System Strategy: Atmospheric Vitality

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"Atmospheric Vitality."** 

This project sits at the intersection of industrial carbon capture and organic biological growth. To reflect this, we are moving away from the "clunky industrial dashboard" aesthetic toward a **High-End Editorial** experience. We treat the interface not as a software tool, but as a living lens. By utilizing "iOS 26" Glassmorphism—a hyper-refined evolution of Apple’s Human Interface Guidelines—we simulate the transparency of air and the fluidity of water. 

We break the "template" look through **Intentional Asymmetry**. Large-scale display typography should often be offset, and overlapping glass layers should create a sense of three-dimensional depth. This is not a flat grid; it is a layered ecosystem.

---

## 2. Colors & Tonal Architecture
The palette transitions from the heavy, grounded tones of 'Carbon' to the ethereal, light-emitting tones of 'Algae' and 'Oxygen.'

### The Color Logic
- **Primary (`#6bfb9a`):** Used for growth-related actions and active states. 
- **Secondary (`#a4c9ff`):** Represents the 'Oxygen' output; used for data visualizations and supportive accents.
- **Surface & Background (`#131313`):** The deep 'Carbon' base that allows glass effects to pop.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Traditional dividers feel "cheap" and structural. Instead, define boundaries through:
- **Tonal Shifts:** Place a `surface_container_high` card on a `surface` background.
- **Negative Space:** Use the Spacing Scale (minimum 32px between sections) to imply separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (#131313).
- **Secondary Layer:** `surface_container_low` for large content areas.
- **Tertiary Layer (Cards):** `surface_container_highest` for interactive elements.
- **The "Glass & Gradient" Rule:** Main CTAs should use a linear gradient from `primary` (#6bfb9a) to `primary_container` (#4ade80) at a 135-degree angle to provide "soul" and depth.

---

### 3. Typography: Bilingual Editorial
We use **Inter** for English and **Apple SD Gothic Neo** for Korean to ensure a premium, unified aesthetic. The hierarchy is designed for an "Editorial First" look, prioritizing readability and prestige.

| Level | Size | Weight | Use Case |
| :--- | :--- | :--- | :--- |
| **Display LG** | 3.5rem | 700 | Hero metrics and impact statements. |
| **Headline MD** | 1.75rem | 600 | Section headers. |
| **Title LG** | 1.375rem | 500 | Card titles and bilingual headers. |
| **Body LG** | 1.0rem | 400 | Primary reading text. |
| **Label SM** | 0.6875rem | 600 | Metadata and micro-copy (Uppercase). |

**Design Note:** When pairing English and Korean, ensure the Korean text is optical-size adjusted (usually 1-2px smaller) to match the visual weight of Inter.

---

## 4. Elevation & Depth (The iOS 26 Glass Effect)
Depth is achieved through **Tonal Layering** rather than structural lines.

### The Layering Principle
Stacking containers creates a "soft lift." 
- **Glassmorphism Spec:** Use `surface_variant` at 40% opacity with a `backdrop-filter: blur(24px)`.
- **Ambient Shadows:** Shadows must be ultra-diffused. Use `on_surface` (#e5e2e1) at 5% opacity with a blur radius of 40px and a Y-offset of 20px. This creates a "glow" rather than a dark "drop shadow."

### The "Ghost Border" Fallback
If accessibility requires a container edge, use a **Ghost Border**:
- **Token:** `outline_variant` (#3d4a3e).
- **Opacity:** 15% - 20%.
- **Stroke:** 1.5px (Avoid 1px; 1.5px feels more deliberate and "retina-optimized").

---

## 5. Components

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. Border-radius: `xl` (3rem). Heavy drop shadow (glow) in active states.
- **Secondary (Glass):** `surface_variant` at 20% opacity + backdrop-filter. No border.
- **Tertiary:** Purely typographic using `secondary` color, with an `arrow_forward` icon.

### Cards & Panels
- **Styling:** Forbid divider lines. Use `md` (1.5rem) padding.
- **Interaction:** On hover, a card should transition from `surface_container_high` to `surface_container_highest` and increase its backdrop-blur intensity.

### Input Fields
- **Background:** `surface_container_lowest` (#0e0e0e).
- **Radius:** `md` (1.5rem).
- **State:** On focus, the "Ghost Border" becomes 100% opaque `primary`.

### Specialized Components: Algae Vitality Gauges
- Custom circular progress rings using a gradient stroke (`primary` to `secondary`).
- Background of the gauge should be a blurred glass "void" to signify the carbon being filled.

---

## 6. Do's and Don'ts

### Do
- **Do use "Breathing Room":** If you think there is enough margin, add 16px more. High-end design thrives on whitespace.
- **Do use Bilingual Overlays:** Place English subtitles in `label-sm` above Korean headers to create an international, sophisticated feel.
- **Do use Organic Curves:** Stick to the `xl` (3rem) or `lg` (2rem) roundedness scale for all large containers.

### Don't
- **Don't use 100% Black:** Always use `surface` (#131313). Pure black (#000000) kills the depth of glass effects.
- **Don't use Default Shadows:** Never use a high-opacity, small-blur shadow. It breaks the "Atmospheric" North Star.
- **Don't use Grid-Lock:** Feel free to let an image or a glass panel break the column container to create an editorial, asymmetrical layout.

---

## 7. Roundedness Scale
Reference these tokens for all container shapes:
- **xl (3rem):** Main app containers and primary buttons.
- **lg (2rem):** Content cards and modal overlays.
- **md (1.5rem):** Input fields and secondary buttons.
- **sm (0.5rem):** Selection chips and tooltips.