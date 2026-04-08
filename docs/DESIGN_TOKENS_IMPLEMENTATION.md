# Design Tokens & Implementation Guide

## Quick Reference for Developers

### Color Tokens

#### Primary Brand Colors
```css
--color-primary-900: #1a2f5c   /* Darkest blue */
--color-primary-700: #3d5a99   /* Dark blue */
--color-primary-500: #3366cc   /* Main brand color */
--color-primary-300: #d9e6ff   /* Light blue */
--color-primary-100: #f2f7ff   /* Very light blue */
```

#### Error / Alert
```css
--color-error-500: #d93333     /* Red for errors/destructive actions */
```

#### Neutral / Grayscale
```css
--color-neutral-900: #262626   /* Text: Primary content */
--color-neutral-800: #3d3d3d   /* Text: Secondary content */
--color-neutral-700: #595959   /* Text: Tertiary content */
--color-neutral-600: #808080   /* Borders: Strong */
--color-neutral-500: #999999   /* Borders: Medium */
--color-neutral-300: #cccccc   /* Borders: Subtle */
--color-neutral-100: #f2f2f2   /* Backgrounds: Subtle */
```

#### Community / Category Colors (Future)
```css
--color-community-1: #ff6b6b   /* Red */
--color-community-2: #ffd93d   /* Yellow */
--color-community-3: #6bcf7f   /* Green */
--color-community-4: #4ecdc4   /* Teal */
--color-community-5: #a78bfa   /* Purple */
--color-community-6: #f87171   /* Light Red */
--color-community-7: #fb923c   /* Orange */
--color-community-8: #8b5cf6   /* Violet */
```

### Spacing Scale (8px Base Unit)

```css
--space-0:     0px      /* No spacing */
--space-xs:    4px      /* 0.5 unit - Tight spacing */
--space-sm:    8px      /* 1 unit - Standard tight */
--space-md:    16px     /* 2 units - Standard */
--space-lg:    24px     /* 3 units - Generous */
--space-xl:    32px     /* 4 units - Large */
--space-2xl:   48px     /* 6 units - Extra large */
--space-3xl:   64px     /* 8 units - Very large */
--space-4xl:   80px     /* 10 units - Maximum */
```

**Usage Pattern**:
```css
/* Padding (internal spacing) */
padding: var(--space-md) var(--space-lg);     /* 16px vertical, 24px horizontal */

/* Margin (external spacing) */
margin-bottom: var(--space-lg);               /* 24px below */

/* Gap (flex/grid spacing) */
gap: var(--space-md);                         /* 16px between items */
```

### Border Radius Scale

```css
--radius-sm:   4px      /* Small: inputs, chips, small buttons */
--radius-md:   8px      /* Medium: cards, standard buttons, modals */
--radius-lg:   12px     /* Large: large containers, special cards */
--radius-full: 9999px   /* Circular: avatars, pill buttons */
```

**Component Usage**:
```
Button:       var(--radius-md)      /* 8px */
Input Field:  var(--radius-sm)      /* 4px */
Card:         var(--radius-md)      /* 8px */
Avatar:       var(--radius-full)    /* Circular */
Badge:        var(--radius-sm)      /* 4px */
```

### Typography Scale

#### Font Families
```css
--font-display: 'Outfit', sans-serif;        /* Headings: H1-H3 */
--font-body:    'Fira Sans', sans-serif;     /* Body text & UI */
--font-code:    'Fira Code', monospace;      /* Code blocks */
--font-base:    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

#### Font Sizes
```css
--font-size-h1: 48px;           /* Display heading 1 */
--font-size-h2: 36px;           /* Display heading 2 */
--font-size-h3: 28px;           /* Display heading 3 */
--font-size-lg: 16px;           /* Large body text */
--font-size-md: 14px;           /* Standard body text */
--font-size-sm: 12px;           /* Small text */
--font-size-xs: 11px;           /* Extra small / caption */
```

#### Line Heights
```css
--line-height-tight:  1.2;      /* Headings */
--line-height-normal: 1.5;      /* Body text */
--line-height-relaxed: 1.75;    /* Accessibility boost */
```

#### Letter Spacing
```css
--letter-spacing-normal:    0;        /* Default */
--letter-spacing-wide:      0.5px;    /* Headings (optional) */
--letter-spacing-caption:   0.3px;    /* Small text emphasis */
```

### Component Specifications

#### Buttons

##### Primary Button
```css
/* Default State */
background-color: var(--color-primary-500);
color: white;
padding: 12px 16px;
font-size: var(--font-size-md);
font-family: var(--font-body);
font-weight: 500;
border-radius: var(--radius-md);
border: none;
cursor: pointer;
min-height: 44px;
transition: all 200ms cubic-bezier(0.33, 0.66, 0.66, 1);

/* Hover State */
background-color: var(--color-primary-700);

/* Active State */
background-color: var(--color-primary-900);

/* Focus State */
outline: 2px solid var(--color-primary-500);
outline-offset: 2px;

/* Disabled State */
opacity: 50%;
cursor: not-allowed;
```

##### Secondary Button
```css
background-color: var(--color-primary-100);
color: var(--color-primary-500);
border: 1px solid transparent;

/* Hover State */
background-color: var(--color-primary-300);

/* Active State */
background-color: var(--color-primary-500);
color: white;
```

##### Danger Button
```css
background-color: var(--color-error-500);
color: white;

/* Hover State */
background-color: #b92525;

/* Active State */
background-color: #99191a;
```

##### Outline Button
```css
background-color: white;
color: var(--color-primary-500);
border: 1px solid var(--color-primary-500);

/* Hover State */
background-color: var(--color-primary-100);

/* Active State */
background-color: var(--color-primary-300);
```

#### Form Inputs

##### Text Input / Textarea
```css
/* Default State */
background-color: white;
border: 1px solid var(--color-neutral-300);
color: var(--color-neutral-900);
padding: 10px 12px;
border-radius: var(--radius-sm);
font-family: var(--font-body);
font-size: var(--font-size-md);
transition: all 200ms cubic-bezier(0.33, 0.66, 0.66, 1);

/* Hover State */
border-color: var(--color-neutral-600);

/* Focus State */
outline: none;
border-color: var(--color-primary-500);
box-shadow: 0 0 0 3px rgba(51, 102, 204, 0.1);

/* Error State */
border-color: var(--color-error-500);
box-shadow: 0 0 0 3px rgba(217, 51, 51, 0.1);

/* Disabled State */
background-color: var(--color-neutral-100);
opacity: 50%;
cursor: not-allowed;
```

##### Checkbox / Radio
```css
/* Default State */
width: 20px;
height: 20px;
border: 2px solid var(--color-neutral-600);
border-radius: var(--radius-sm);  /* sm for checkbox, full for radio */
cursor: pointer;
transition: all 200ms cubic-bezier(0.33, 0.66, 0.66, 1);

/* Hover State */
border-color: var(--color-primary-500);

/* Checked State */
background-color: var(--color-primary-500);
border-color: var(--color-primary-500);
color: white;

/* Focus State */
outline: 2px solid var(--color-primary-500);
outline-offset: 2px;
```

#### Cards
```css
background-color: white;
border: 1px solid var(--color-neutral-300);
border-radius: var(--radius-md);
padding: 16px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
transition: all 200ms cubic-bezier(0.33, 0.66, 0.66, 1);

/* Hover State (Interactive) */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
transform: translateY(-2px);
```

#### Badges
```css
display: inline-flex;
align-items: center;
gap: var(--space-xs);
padding: 4px 8px;
border-radius: var(--radius-sm);
font-family: var(--font-body);
font-size: var(--font-size-sm);
font-weight: 500;
white-space: nowrap;

/* Type: EXTRACTED */
background-color: var(--color-primary-500);
color: white;

/* Type: INFERRED */
background-color: #ffd93d;
color: var(--color-neutral-900);

/* Type: Community */
/* Use community color from list above */
```

#### Navigation Header
```css
height: 56px;
background-color: var(--color-primary-500);
display: flex;
align-items: center;
padding: 0 var(--space-lg);
gap: var(--space-lg);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Logo */
color: white;
font-weight: bold;
font-size: 20px;

/* Links */
color: rgba(255, 255, 255, 0.9);
transition: color 200ms;
```

#### Sidebar
```css
width: 240px;
background-color: var(--color-neutral-100);
border-right: 1px solid var(--color-neutral-300);
padding: var(--space-lg);

/* Menu Items */
padding: var(--space-md) var(--space-md);
border-radius: var(--radius-sm);
cursor: pointer;
transition: all 200ms cubic-bezier(0.33, 0.66, 0.66, 1);

/* Hover State */
background-color: rgba(51, 102, 204, 0.1);
color: var(--color-primary-500);

/* Active State */
background-color: var(--color-primary-100);
color: var(--color-primary-500);
font-weight: 500;
```

### Motion & Animation

#### Standard Timing Function
```css
/* Entry animation (fade in, slide in) */
transition: all 200ms cubic-bezier(0.33, 0.66, 0.66, 1);

/* Exit animation (fade out, slide out) */
transition: all 200ms cubic-bezier(0.66, 0.33, 1, 0.66);
```

#### Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Usage */
animation: fadeIn 200ms cubic-bezier(0.33, 0.66, 0.66, 1);
animation: slideInUp 300ms cubic-bezier(0.33, 0.66, 0.66, 1);
animation: spin 1s linear infinite;
```

#### Duration Standards
```css
--duration-fast:      100ms;  /* Micro-interactions */
--duration-normal:    200ms;  /* State changes */
--duration-deliberate: 300ms;  /* Page transitions */
--duration-slow:      500ms;  /* Loading states */
```

### Responsive Breakpoints

```css
/* Mobile First Approach */

/* Mobile: 320px - 479px */
@media (max-width: 479px) {
  /* Single column layout */
  /* Full-width components */
  /* Touch-friendly sizing (44px min) */
  /* Simplified navigation */
}

/* Tablet: 480px - 767px */
@media (min-width: 480px) and (max-width: 767px) {
  /* 2-column layout */
  /* Sidebar drawer toggle */
  /* Adjusted spacing */
}

/* Desktop: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2-3 column layout */
  /* Visible sidebar */
  /* Increased spacing */
}

/* Large Desktop: 1024px - 1439px */
@media (min-width: 1024px) and (max-width: 1439px) {
  /* 3-4 column layout */
  /* Full sidebar + content + right panel */
  /* Maximum spacing */
}

/* Wide: 1440px+ */
@media (min-width: 1440px) {
  /* Full 4+ column layout */
  /* Max-width container (1440px) */
  /* Maximum spacing and padding */
}
```

### Accessibility Implementation

#### Color Contrast
```css
/* Ensure all text meets WCAG AA standards */

/* Primary text on white */
color: var(--color-neutral-900);  /* 6.1:1 ratio ✅ */

/* Secondary text */
color: var(--color-neutral-700);  /* 4.5:1 ratio ✅ */

/* Avoid using these for text alone */
color: var(--color-neutral-500);  /* 3.2:1 - Only with icon support */
```

#### Focus Management
```css
/* All interactive elements must have visible focus */

:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Form inputs */
input:focus,
textarea:focus,
select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(51, 102, 204, 0.1);
}

/* Buttons */
button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

#### Motion Preferences
```css
/* Respect user motion preferences */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### Screen Reader Support
```html
<!-- Form labels -->
<label for="input-name">Name:</label>
<input id="input-name" type="text" />

<!-- Error messages -->
<input aria-describedby="error-email" />
<p id="error-email">Invalid email address</p>

<!-- Required fields -->
<input aria-required="true" />

<!-- Loading states -->
<div aria-busy="true" aria-live="polite">Loading...</div>

<!-- Icons with text -->
<span aria-label="Close">✕</span>
```

---

## CSS Variable Implementation Example

```css
:root {
  /* Colors */
  --color-primary-500: #3366cc;
  --color-error-500: #d93333;
  --color-neutral-900: #262626;
  
  /* Spacing */
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  
  /* Typography */
  --font-body: 'Fira Sans', sans-serif;
  --font-size-md: 14px;
  
  /* Border Radius */
  --radius-md: 8px;
  
  /* Motion */
  --duration-normal: 200ms;
  --ease-out: cubic-bezier(0.33, 0.66, 0.66, 1);
}

/* Usage */
.button {
  background-color: var(--color-primary-500);
  padding: var(--space-md) var(--space-lg);
  font-family: var(--font-body);
  font-size: var(--font-size-md);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-out);
}

.button:hover {
  background-color: #2d5ab8;
}
```

---

## References

- **Figma Design System**: JOFWjfO3BOmz14Nqm4aU9a
- **Color System**: OKLCH (perceptually uniform)
- **Framework**: Impeccable Design System
- **Aesthetic**: Analytical Minimalism
- **WCAG Compliance**: Level AA
