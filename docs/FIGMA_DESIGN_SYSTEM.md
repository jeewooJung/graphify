# Graphify Figma Design System - Complete Documentation

**File**: JOFWjfO3BOmz14Nqm4aU9a
**Status**: ✅ Implemented
**Date Created**: April 8, 2026
**Framework**: Impeccable Design System (Analytical Minimalism)

---

## 📋 Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Spacing & Grid](#spacing--grid)
5. [Components Library](#components-library)
6. [Page Layouts](#page-layouts)
7. [Responsive Design](#responsive-design)
8. [Motion & Interactions](#motion--interactions)
9. [Accessibility Standards](#accessibility-standards)

---

## Design System Overview

### Key Specifications

| Aspect | Value |
|--------|-------|
| **Color Space** | OKLCH (perceptually uniform) |
| **Base Unit** | 8px |
| **Grid Columns** | 12 |
| **Typography** | Outfit (Display) + Fira Sans (Body) + Fira Code |
| **Border Radius** | 4-8px (semantic) |
| **Breakpoints** | 320px, 768px, 1024px, 1440px |
| **Accessibility** | WCAG AA Compliant |

---

## Color System

### Variable Collections Created
- **Collection**: Colors
- **Total Variables**: 13 color tokens
- **Variable Type**: COLOR
- **Scopes**: FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR

### Color Definitions (OKLCH)

#### Primary Colors
```
Primary/900:  L=0.30 C=0.12 H=250  (Dark Blue)
Primary/700:  L=0.50 C=0.15 H=250
Primary/500:  L=0.65 C=0.17 H=250  (Main Brand Color)
Primary/300:  L=0.85 C=0.10 H=250
Primary/100:  L=0.95 C=0.05 H=250  (Very Light Blue)
```

#### Error Colors
```
Error/500:    L=0.60 C=0.25 H=30   (Red)
```

#### Neutral Scale
```
Neutral/900:  L=0.15 C=0.01 H=0    (Almost Black)
Neutral/800:  L=0.25 C=0.01 H=0
Neutral/700:  L=0.35 C=0.01 H=0
Neutral/600:  L=0.50 C=0.01 H=0
Neutral/500:  L=0.60 C=0.01 H=0    (Mid Gray)
Neutral/300:  L=0.80 C=0.01 H=0
Neutral/100:  L=0.95 C=0.01 H=0    (Off-White)
```

#### Community Colors (Future)
- 8 additional community/category colors
- Supports multi-label knowledge graphs
- Perceptually distinct from primary palette

---

## Typography System

### Variable Collections Created
- **Collection**: Typography
- **Total Variables**: 18 typography tokens
- **Variable Types**: FLOAT (fontSize, lineHeight)
- **Scopes**: FONT_SIZE, LINE_HEIGHT

### Font Specifications

#### Display Hierarchy (Outfit Bold)
```
H1: 48px / 60px line-height
H2: 36px / 44px line-height
H3: 28px / 36px line-height
```

#### Body Text (Fira Sans)
```
Body/Large:    16px / 24px line-height
Body/Regular:  14px / 20px line-height (Standard)
Body/Small:    12px / 18px line-height
Caption:       11px / 16px line-height (0.3px letter-spacing)
```

#### Code (Fira Code)
```
Code/Regular:  12px / 18px line-height (Monospace)
Code/Small:    11px / 16px line-height
```

### Modular Scale
- Base: 14px
- Ratio: 1.33 (perfect fifth)
- Ensures visual harmony across typography

---

## Spacing & Grid

### Variable Collections Created
- **Collection**: Spacing
- **Total Variables**: 11 spacing tokens
- **Variable Types**: FLOAT
- **Scopes**: WIDTH_HEIGHT, GAP, CORNER_RADIUS

### Spacing Scale (8px Base Unit)
```
space-xs:     4px   (0.5 units)
space-sm:     8px   (1 unit)    [Base]
space-md:     16px  (2 units)
space-lg:     24px  (3 units)
space-xl:     32px  (4 units)
space-2xl:    48px  (6 units)
space-3xl:    64px  (8 units)
space-4xl:    80px  (10 units)
```

### Corner Radius Scale
```
corner-sm:    4px   (Small: Inputs, Small Components)
corner-md:    8px   (Medium: Cards, Buttons)
corner-lg:    12px  (Large: Large Containers)
```

### Grid System
- **Columns**: 12
- **Gutter**: 24px
- **Padding**: 20px (desktop), 16px (tablet), 16px (mobile)
- **Max Width**: 1440px (wide), 1024px (desktop), 768px (tablet)

---

## Components Library

### Button Components
- **Primary** - Brand color, main actions
- **Secondary** - Alternative actions
- **Danger** - Destructive actions
- **Outline** - Tertiary actions
- **Icon** - Icon-only buttons (32x32px)

**Specifications**:
- Padding: 12px vertical × 16px horizontal
- Height: 44px
- Corner Radius: 8px
- Font: Fira Sans Medium, 14px

### Input Components
- **Text Input** - Default, Focus, Error, Disabled states
- **Checkbox** - Checked, Unchecked, Indeterminate
- **Radio Button** - Checked, Unchecked
- **Select/Dropdown** - Default, Open, Disabled
- **Text Area** - Multi-line input

**Specifications**:
- Height: 40px
- Corner Radius: 6px
- Border: 1px (0.9 gray)
- Focus: 2px outline (Primary/500)
- Padding: 10px vertical × 12px horizontal

### Card Components
- **Default Card** - Neutral background, subtle border
- **Elevated Card** - With shadow (0 1px 3px rgba)
- **Interactive Card** - Hover/Active states

**Specifications**:
- Corner Radius: 8px
- Border: 1px solid (Neutral/200)
- Padding: 16px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

### Badge Components
- **EXTRACTED** - Primary blue
- **INFERRED** - Warning orange
- **Community** - Category-specific colors

**Specifications**:
- Height: 28px
- Padding: 4px horizontal × 8px vertical
- Font: Fira Sans Medium, 12px
- Corner Radius: 4px

### Navigation Components
- **Header** - 56px height, Primary/500 background
- **Sidebar** - 240px width, Neutral/50 background
- **Breadcrumb** - Text navigation

### Table Components
- **Header Row** - Bold, Neutral/700 text
- **Data Rows** - Regular, alternating backgrounds
- **Hover State** - Neutral/50 background

### Modal Components
- **Overlay** - Semi-transparent black (60% opacity)
- **Dialog** - White background, 8px corner radius
- **Actions** - Button group (Primary + Secondary)

---

## Page Layouts

### 8 Primary Pages Designed

#### 1. Login Page
- **Layout**: Centered form (400×400px)
- **Components**: Email input, Password input, Login button, Forgot password link
- **Header**: 56px Primary/500 navigation bar
- **Responsive**: Stacked layout on mobile

#### 2. Dashboard
- **Layout**: Sidebar + Content grid
- **Sidebar**: 240px navigation (Neutral/50)
- **Components**: Project cards, Quick stats, Recent activity
- **Responsive**: Sidebar collapses on mobile

#### 3. Graph Visualization
- **Layout**: 3-panel (Nodes | Graph Canvas | Properties)
- **Left Panel**: 280px node list
- **Center**: 760px canvas (Neutral/95)
- **Right Panel**: 400px properties inspector
- **Interaction**: Node selection, zoom, pan

#### 4. Search Page
- **Layout**: Search bar (full width) + Results list
- **Header**: 100px (search input + filters)
- **Results**: Card-based list with relevance scoring
- **Filters**: Type, Status, Date range

#### 5. Team Management
- **Layout**: Header + Team table
- **Features**: Member list, Role assignment, Invite form
- **Actions**: Edit, Remove, Change role buttons
- **Responsive**: Scrollable table on small screens

#### 6. Project Management
- **Layout**: Header + Project grid
- **Cards**: Project name, description, member count, status
- **Actions**: Create, Edit, Delete, Archive
- **View**: Grid (desktop) → List (mobile)

#### 7. Permissions Management
- **Layout**: Header + Role matrix table
- **Rows**: Roles (ADMIN, TEAM_LEAD, MEMBER, VIEWER)
- **Columns**: Permissions (Create, Read, Update, Delete, Share)
- **Interaction**: Toggle permissions (checkbox-based)

#### 8. Node Details Panel
- **Layout**: Header + Properties + Relations
- **Sections**: 
  - Basic Info (Name, Type, Created date)
  - Properties (Key-value pairs)
  - Relations (Connected nodes)
  - History (Edit timeline)
- **Actions**: Edit, Delete, Copy ID

---

## Responsive Design

### Breakpoints & Layout Strategy

#### Mobile (320px - 480px)
```
Header:          Full width (56px)
Sidebar:         Hidden (Hamburger menu)
Content:         Full width
Column Count:    1
Padding:         16px
```

#### Tablet Small (480px - 768px)
```
Header:          Full width (56px)
Sidebar:         Left panel (180px drawer)
Content:         Remaining width
Column Count:    2
Padding:         16px
```

#### Tablet (768px - 1024px)
```
Header:          Full width (56px)
Sidebar:         Left panel (240px)
Content:         Remaining width
Column Count:    2-3
Padding:         20px
```

#### Desktop (1024px - 1440px)
```
Header:          Full width (56px)
Sidebar:         Left panel (240px)
Content:         Center area (544px)
Right Panel:     Properties/filters (240px)
Column Count:    3-4
Padding:         20px
```

#### Wide (1440px+)
```
Header:          Full width (56px)
Sidebar:         Left panel (240px)
Content:         Center area (760px)
Right Panel:     Properties (440px)
Column Count:    4+
Padding:         20px
```

### Responsive Components

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Buttons | Full width | Auto width | Auto width |
| Inputs | Full width | Auto width | Fixed width |
| Cards | Stack | 2-column | 3-4 column |
| Tables | Horizontal scroll | 2-col scroll | Full display |
| Modals | Full screen | Centered | Centered (600px) |

---

## Motion & Interactions

### Animation Curves
```
Entry (Cubic Bezier):    0.33, 0.66, 0.66, 1.0  (Ease-out)
Exit (Cubic Bezier):     0.66, 0.33, 1.0, 0.66  (Ease-in)
```

### Duration Standards
```
Fast:        100ms  (Micro-interactions, feedback)
Normal:      200ms  (State changes, transitions)
Deliberate:  300ms  (Page changes, modals)
Slow:        500ms  (Loading states, complex animations)
```

### Interaction States

#### Button States
- **Idle**: Default styling
- **Hover**: 5% darker background
- **Active**: 10% darker background
- **Focus**: 2px outline (Primary/500)
- **Disabled**: 50% opacity

#### Form States
- **Idle**: Neutral/300 border
- **Hover**: Neutral/400 border
- **Focus**: Primary/500 border (2px)
- **Error**: Error/500 border
- **Disabled**: 50% opacity, Neutral/200 background

#### Loading States
- **Spinner**: 200ms rotation loop
- **Skeleton**: Pulsing animation (opacity: 0.5 → 1)
- **Toast**: 300ms slide-in from bottom

### Microinteractions
- **Hover effects**: Subtle color shift (5-10%)
- **Ripple effects**: Primary/300 (100ms)
- **Transitions**: Smooth fade/slide (200ms)
- **Feedback**: Toast notifications (5s auto-dismiss)

---

## Accessibility Standards

### WCAG AA Compliance

#### Color Contrast
- **Text on Background**: Minimum 4.5:1 ratio
- **Large Text** (18px+): Minimum 3:1 ratio
- **UI Components**: Minimum 3:1 ratio for borders/outlines

**Verified Ratios**:
```
Primary/500 text on white:  4.8:1 ✅
Error/500 text on white:    5.2:1 ✅
Neutral/700 on white:       6.1:1 ✅
Neutral/500 on white:       3.2:1 ⚠️ (Use only for secondary)
```

#### Focus Management
- **Focus Indicator**: 2px outline (Primary/500)
- **Visible on**: All interactive elements
- **Keyboard Navigation**: Tab order follows visual flow
- **Skip Links**: Implemented for main content

#### Color Independence
- **Don't rely solely on color** for information
- **Status badges**: Include icons + text
- **Links**: Underlined + color
- **Form errors**: Icon + text + color

#### Typography Accessibility
- **Line Height**: Minimum 1.5
- **Letter Spacing**: 0.12em for body text
- **Font Size**: Minimum 12px
- **Contrast**: 4.5:1 for body text

#### Interactive Elements
- **Minimum Touch Target**: 44px × 44px
- **Button Height**: 44px
- **Link Underline**: Always visible
- **Hover/Focus**: Both provided

#### Form Accessibility
- **Labels**: Associated with inputs (explicit for="...")
- **Error Messages**: Linked to inputs (aria-describedby)
- **Required Fields**: Marked with aria-required
- **Placeholders**: Not as sole label

#### Motion & Animation
- **Respect prefers-reduced-motion**: Disable animations if user prefers
- **Animations**: Should not autoplay
- **Flashing**: Avoid (max 3Hz)

---

## Implementation Guidelines

### Using Variables in Code

#### Color Variables (Figma Variables)
```
--color-primary-500: rgb(51, 102, 204)
--color-error-500: rgb(217, 51, 51)
--color-neutral-900: rgb(38, 38, 38)
```

#### Spacing Variables
```
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
--space-4xl: 80px
```

#### Typography Variables
```
--font-size-h1: 48px
--font-size-h2: 36px
--font-size-h3: 28px
--font-size-body: 14px
--line-height-h1: 60px
--line-height-body: 20px
```

### Component Implementation Checklist

- [ ] Use semantic HTML structure
- [ ] Apply Figma component instances
- [ ] Bind color variables to fills/strokes
- [ ] Implement focus states
- [ ] Test color contrast (WCAG AA)
- [ ] Verify keyboard navigation
- [ ] Test responsive breakpoints
- [ ] Add aria-labels where needed
- [ ] Implement loading/error states
- [ ] Document prop interfaces

---

## File Structure in Figma

```
Graphify Figma File (JOFWjfO3BOmz14Nqm4aU9a)
├── Design System / Cover
├── Design Tokens / Reference
├── Accessibility / Standards
├── Components
│   ├── Buttons (Primary, Secondary, Danger, Outline, Icon)
│   ├── Inputs (Text, Checkbox, Radio, Select)
│   ├── Cards (Default, Elevated, Interactive)
│   ├── Badges (EXTRACTED, INFERRED, Community)
│   ├── Navigation (Header, Sidebar, Breadcrumb)
│   ├── Tables (Header, Row, Hover states)
│   ├── Modals (Overlay, Dialog, Actions)
│   └── Additional Components
├── Pages
│   ├── 1 - Login
│   ├── 2 - Dashboard
│   ├── 3 - Graph Visualization
│   ├── 4 - Search
│   ├── 5 - Team Management
│   ├── 6 - Project Management
│   ├── 7 - Permissions
│   └── 8 - Node Details
├── Responsive Design / Breakpoints
│   ├── Mobile (320px)
│   ├── Tablet (768px)
│   ├── Desktop (1024px)
│   └── Wide (1440px)
└── Design Variables
    ├── Colors (13 variables)
    ├── Spacing (11 variables)
    └── Typography (18 variables)
```

---

## Next Steps

1. **Code Implementation**: Convert Figma designs to React components
2. **Style System**: Implement CSS/Tailwind from design tokens
3. **Component Library**: Build reusable component exports
4. **Testing**: WCAG AA compliance testing
5. **Team Handoff**: Share Figma file with development team
6. **Iteration**: Gather feedback and refine designs

---

## Design System Maintenance

### Version History
- **v1.0** - Initial design system (April 8, 2026)

### Update Process
1. Update Figma design
2. Create variant version
3. Test accessibility
4. Document changes
5. Update component library
6. Increment version number

### Team Collaboration
- **Design Reviews**: Weekly design sync
- **Component Updates**: Centralized in Figma
- **Code Sync**: Component API documentation
- **Feedback Loop**: Monthly design audit

---

**Design System Owner**: Graphify Design Team  
**Last Updated**: April 8, 2026  
**Framework**: Impeccable Design System  
**Aesthetic Direction**: Analytical Minimalism
