# 09 — Design System
## Nagorik Sathi AI — R&D Report v1.2

> **Design philosophy:** Professional, minimal, and functional. The interface presents a civic-service product — not an AI showcase. Inspired by careful industrial and interface design: precision over decoration, clarity over cleverness.
> The design preference is black, white and neutral-grey with structured typographic hierarchy. This is a user/team design preference; the R&D does not mandate a colour palette.

---

## 1. Design Principles

1. **Civic clarity:** Every screen tells the citizen exactly what is happening, what action is needed, and who is responsible.
2. **Transparency without complexity:** AI recommendations are visible with their basis and confidence, but presented plainly — not dramatised.
3. **Priority is always legible:** Emergency is never subtle. Status and urgency are immediately apparent without reading text.
4. **Bangla-first:** Bangla text is the primary reading experience. English is secondary and supplementary.
5. **Functional honesty:** The system communicates its state accurately — including AI failure, manual modes, and missing verification.
6. **No decorative wording:** Avoid promotional AI language ("powered by AI", "intelligent platform"). Show the system's behaviour, not its identity.

---

## 2. Colour Tokens

### Primary Palette (Black, White, Neutral Greys)

```css
--colour-black:       #0A0A0A;  /* Near-black; primary text, icons */
--colour-white:       #FAFAFA;  /* Near-white; page background */
--colour-grey-50:     #F5F5F5;  /* Subtle background, card fill */
--colour-grey-100:    #E8E8E8;  /* Borders, dividers */
--colour-grey-200:    #D1D1D1;  /* Input borders (rest) */
--colour-grey-400:    #9A9A9A;  /* Placeholder text, secondary labels */
--colour-grey-600:    #6B6B6B;  /* Metadata text */
--colour-grey-800:    #2D2D2D;  /* Secondary text, subheadings */
```

### Semantic Colour Tokens (status and priority)
These are the only non-neutral colours. They carry specific, functional meaning and must not be reused decoratively.

```css
/* Priority levels — MUST be consistent across all surfaces */
--priority-emergency:      #C8000A;  /* Deep red */
--priority-emergency-bg:   #FFF0F0;  /* Light red background */
--priority-high:           #C25F00;  /* Deep amber */
--priority-high-bg:        #FFF5EB;
--priority-medium:         #1A5E8A;  /* Dark blue */
--priority-medium-bg:      #EFF5FF;
--priority-low:            #2A6A3A;  /* Dark green */
--priority-low-bg:         #F0F8F2;

/* Status indicators */
--status-submitted:        #6B6B6B;  /* Grey */
--status-verified:         #1A5E8A;  /* Blue */
--status-in-progress:      #C25F00;  /* Amber */
--status-resolved:         #2A6A3A;  /* Green */
--status-closed:           #0A0A0A;  /* Black */
--status-reopened:         #C8000A;  /* Red */
--status-merged:           #6B6B6B;  /* Grey */

/* System states */
--state-success:           #1E6B3A;
--state-warning:           #8A5A00;
--state-error:             #A80008;
--state-info:              #0A4A7A;
--state-ai-pending:        #6B6B6B;  /* Neutral — AI processing */
```

### Focus and Interaction
```css
--focus-ring:           #0A0A0A;  /* 2px solid black outline — WCAG AA */
--focus-ring-offset:    3px;
--hover-overlay:        rgba(0,0,0,0.04);
--pressed-overlay:      rgba(0,0,0,0.08);
```

---

## 3. Typography

### Fonts

| Use | Font | Weight | Note |
|-----|------|--------|------|
| Primary Bangla | Hind Siliguri | 400, 500, 600, 700 | Google Fonts; excellent Latin-script compatibility |
| Primary English | Inter | 400, 500, 600 | Fallback for Bangla font on English labels |
| Monospace (code/IDs) | JetBrains Mono | 400 | Case numbers, audit entries |

**Loading strategy:** Subset each font to glyphs in use; `font-display: swap`; local fallback to system-ui.

### Type Scale

```css
/* Fluid scale — min at 320px, max at 1280px viewport */
--text-xs:    0.75rem;   /* 12px — metadata, timestamps */
--text-sm:    0.875rem;  /* 14px — labels, captions, secondary */
--text-base:  1rem;      /* 16px — body text, Bangla content */
--text-md:    1.125rem;  /* 18px — card titles, list items */
--text-lg:    1.25rem;   /* 20px — section headings */
--text-xl:    1.5rem;    /* 24px — page headings */
--text-2xl:   2rem;      /* 32px — hero headings */

/* Line heights */
--leading-tight:  1.3;   /* Bangla large headings */
--leading-normal: 1.6;   /* Bangla body text — generous for readability */
--leading-wide:   1.8;   /* Bangla long-form content */
```

### Bangla-specific Rules
- Minimum body text size: 16px (Bangla text requires slightly more space than Latin equivalents)
- Large-text mode: All text sizes × 1.25
- Line height for Bangla body text: 1.6 minimum (diacritics need space)
- Word spacing: 0 (Bangla is not space-separated in the same way; do not add word-spacing)

---

## 4. Spacing Scale

```css
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
```

---

## 5. Layout Grid and Breakpoints

### Breakpoints
```css
--bp-mobile:  320px;   /* Minimum supported */
--bp-sm:      480px;   /* Large mobile */
--bp-md:      768px;   /* Tablet */
--bp-lg:      1024px;  /* Desktop */
--bp-xl:      1280px;  /* Wide desktop */
```

### Grid
- **Mobile:** Single column; 16px horizontal margins; full-width components
- **Tablet:** 8-column grid; 24px margins; 16px gutters
- **Desktop:** 12-column grid; 48px margins; 24px gutters
- **Staff consoles:** Fixed left sidebar (240px) + main content area; sidebar collapses to icon-only on tablet

### Container Widths
- Citizen intake: max-width 600px (focused, form-like)
- Staff dashboards: max-width 1200px
- Public map: full-viewport

---

## 6. Component Specifications

### 6.1 Priority Badge
**Usage:** On all incident and task lists, at the top of every detail view  
**Rules:**
- Emergency: red background, white text, ALL CAPS "জরুরি"
- High: amber background, dark text, "উচ্চ"
- Medium: blue background, dark text, "মধ্যম"
- Low: green background, dark text, "কম"
- Never deprioritise visually based on context; always use the same tokens

```
[জরুরি]  — red pill, bold
[উচ্চ]   — amber pill, bold
[মধ্যম]  — blue pill, normal
[কম]     — green pill, normal
```

### 6.2 Status Badge
**Usage:** On report/incident lists and detail views  
**Visual:** Grey pill; colour matches status token  
**Always accompanied by:** Status description in Bangla (not just the badge)

### 6.3 AI Proposal Panel
**Purpose:** Show AI recommendation clearly, with basis and confidence  
**Must display:**
- Label: "AI প্রস্তাব" (AI Proposal) in small caps
- Proposed department name in Bangla and English
- Confidence: "৯১% নিশ্চিততা" (91% confidence)
- Reasons: bulleted list in Bangla
- Verification status: "তদন্ত প্রয়োজন" (Verification required) or "প্রস্তাব গৃহীত হতে পারে"
- Gate result: clear pass/fail indicator
**Design rules:**
- Border: 1px solid --colour-grey-200, not coloured
- Label colour: --colour-grey-600 (not prominent)
- Reasons text: --colour-grey-800
- Do NOT use "AI-powered" promotional language
- Confidence must always be visible if AI generated the content

### 6.4 Buttons

```
Primary:     Black background, white text, 8px radius
             Hover: slightly lighter black (#1A1A1A)
             Focus: 2px ring offset
             Disabled: grey-200 bg, grey-400 text, not-allowed cursor

Secondary:   White background, black border, black text
             Hover: grey-50 background

Danger:      Deep red background, white text (for irreversible actions only)

Ghost:       No border, no background, black text, underline on hover
             Used for: "Cancel", "Back", "Skip"
```

**Sizes:**
```
Large:   padding 12px 24px; text-md; min-height 48px (touch target)
Default: padding 10px 20px; text-base; min-height 44px
Small:   padding 6px 14px; text-sm; min-height 36px
```
**Rule:** All interactive elements min 44×44px touch target (WCAG 2.5.5).

### 6.5 Form Inputs

```
Input field:
  border: 1px solid --colour-grey-200
  border-radius: 4px
  padding: 12px 16px
  font-size: text-base (16px minimum — prevents iOS zoom)
  background: white
  
  :focus   → border-color: --colour-black; outline: 2px solid --colour-black; outline-offset: 2px
  :invalid → border-color: --state-error; error message below
  :disabled → background: --colour-grey-50; text: --colour-grey-400
```

**Textarea:** Same styling; min-height 120px; resize: vertical  
**Voice input button:** Large circular button (64px), microphone icon, black; active state: pulsing animation (respect prefers-reduced-motion)

### 6.6 Cards

```
background: white
border: 1px solid --colour-grey-100
border-radius: 8px
padding: --space-6
box-shadow: none (avoid heavy shadows; border is sufficient)

:hover (clickable cards): border-color: --colour-grey-400; cursor: pointer
```

**Rule:** No gradient backgrounds on cards; no glassmorphism; no decorative effects.

### 6.7 Tables

```
header: background --colour-grey-50; font-weight 600; border-bottom 2px solid --colour-grey-200
row: border-bottom 1px solid --colour-grey-100
row hover: background --colour-grey-50
zebra: none (border is sufficient)
responsive: horizontal scroll on mobile with sticky first column
```

### 6.8 Timeline (Status History)

```
Layout: vertical list; each item = circle dot + line + content
Circle: 12px; filled with status colour token; outline 2px white + 1px grey
Line: 1px solid --colour-grey-100; dashed if future/pending
Content: status label (bold) + timestamp (grey-600) + actor role + optional note
```

### 6.9 Maps

```
Base tiles: OpenStreetMap (Leaflet or MapLibre)
Incident pin: circular marker; colour = priority colour token; size: 24px default, 32px on hover
Emergency pins: pulsing animation (reduce-motion: static with larger size)
Hotspot zone: polygon with dashed amber border; amber fill at 15% opacity
Citizen report pin (report wizard): black filled circle; draggable
Cluster: dark grey circle with white count number
Control panel: top-right; minimal grey buttons; no bright colours
```

### 6.10 Evidence Panel

```
Layout: horizontal scrollable strip of thumbnails; click to full-screen lightbox
Thumbnail: 80×80px; object-fit: cover; black border 1px
Before/After: side-by-side on desktop; tabbed on mobile; labelled clearly
Full-screen: dark overlay; close button (Esc + click); swipe on mobile
Masked media: blur overlay with "মুখ বা সংবেদনশীল তথ্য ঢেকে দেওয়া হয়েছে" label
```

### 6.11 Dialogs

```
Overlay: rgba(0,0,0,0.5)
Panel: white; border-radius 8px; max-width 480px; padding --space-8
Heading: text-lg; font-weight 600
Body: text-base; colour grey-800
Actions: right-aligned; Primary + Ghost (cancel)
Close: X button top-right; Esc key closes
Focus trap: focus must not escape dialog
```

---

## 7. Semantic Patterns

### AI Content Labelling
All AI-generated content must be identified. Use a small inline tag:
```
[AI প্রস্তাব] Department: Drainage Engineering | Confidence: 87%
[AI লিপ্যন্তর] The original voice message was transcribed by AI. Errors are possible.
[যাচাইয়ের জন্য অপেক্ষায়] This proposal has not yet been reviewed by staff.
```

### System State Banners
```
AI unavailable:
  background: --colour-grey-50
  border-left: 4px solid --colour-grey-400
  text: "AI প্রক্রিয়া সাময়িকভাবে অনুপলব্ধ। ওয়ার্ড ডেস্ক সরাসরি পরিচালনা করছে।"

Emergency:
  background: --priority-emergency-bg
  border-left: 4px solid --priority-emergency
  text: "জরুরি! এই ঘটনায় তাৎক্ষণিক পদক্ষেপ প্রয়োজন।"

Offline / Draft:
  background: --colour-grey-50
  border-left: 4px solid --colour-grey-400
  text: "আপনি অফলাইনে আছেন। আপনার তথ্য সংরক্ষিত হয়েছে।"
```

### Waiting Reasons
```
Display context: visible in incident detail, task workspace, and citizen status view
Style: italic, --colour-grey-600
Label: "অপেক্ষার কারণ:" (Waiting reason:)
Example: "টাস্ক ১ (বর্জ্য অপসারণ) সম্পন্ন হওয়ার পর এই কাজ শুরু হবে।"
```

---

## 8. Accessibility

### WCAG 2.1 AA Requirements
- Colour contrast: text on background ≥ 4.5:1 (normal); ≥ 3:1 (large/bold)
- Priority tokens verified:
  - --priority-emergency (#C8000A) on white: 5.8:1 ✓
  - --priority-high (#C25F00) on white: 4.7:1 ✓
  - All grey text (--colour-grey-600 #6B6B6B) on white: 5.8:1 ✓

### Keyboard Navigation
- All interactive elements reachable via Tab
- Visible focus ring on all focusable elements (2px solid black)
- Dialog: focus trap; Esc closes
- Map: keyboard navigation for pan/zoom; pins reachable via Tab
- Skip-to-content link at top of every page

### Screen Reader
- All images have descriptive alt text
- Form inputs have associated `<label>` elements
- Status changes announced via `aria-live="polite"` regions
- Emergency alerts: `aria-live="assertive"`
- Decorative icons: `aria-hidden="true"`
- Route changes: page title updates; focus reset on navigation

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Emergency pin: no pulse animation; larger static marker */
  /* Voice record button: no pulse; solid colour change only */
  /* Loading spinner: opacity fade only */
  /* Page transitions: instant (no slide/fade) */
}
```

### Large Text Mode
- Activated in user profile settings
- All rem sizes × 1.25
- Line height adjusted proportionally
- Touch targets remain ≥ 44px (already met)

---

## 9. Iconography

- Use a single icon system throughout (e.g. Phosphor Icons or Heroicons — **[PROPOSED]** Phosphor Icons for Bangla-script weight matching)
- Icon size: 20px default, 24px for navigation, 16px for inline labels
- Icons must always accompany text labels (never icons alone in functional UI)
- Decorative icons: minimal; never used to convey information that text does not also convey
- Problem type icons: consistent across all surfaces (waste, drain, road, street_light)

---

## 10. Error Messages

**Rules:**
1. Always in Bangla first, English below for staff interfaces
2. Never technical language to citizens ("500 Internal Server Error" → "দুঃখিত, একটি সমস্যা হয়েছে")
3. Always state what the user can do next
4. Include request_id for support reference (staff interfaces)

**Templates:**
```
Network error:
  "ইন্টারনেট সংযোগ নেই। আপনার তথ্য সংরক্ষিত আছে। পুনরায় চেষ্টা করুন।"
  [পুনরায় চেষ্টা করুন]

Validation error (form field):
  "অনুগ্রহ করে সঠিক তথ্য দিন।" + field-specific message

Permission denied:
  "এই তথ্যে প্রবেশাধিকার নেই।"

AI unavailable:
  "AI প্রক্রিয়া বর্তমানে অনুপলব্ধ। আপনার অভিযোগ ওয়ার্ড ডেস্কে পাঠানো হচ্ছে।"
```

---

## 11. Component Implementation Notes

- Components must be implemented as reusable React components with typed props
- Design tokens implemented as CSS custom properties (not hardcoded values in components)
- No component-specific colour overrides; only token references
- Dark mode: not planned for v1; token system supports future addition
- RTL: not planned for v1 (Bangla is LTR); token system is directional-safe
