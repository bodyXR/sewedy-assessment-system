# Landing Page Components

Premium, cinematic components for the Assessor landing page.

## 🎨 Component Overview

### Navigation (`navigation.tsx`)

Fixed header that transforms on scroll with glass morphism effect.

**Features:**

- Scroll-based backdrop blur activation
- Smooth anchor link navigation
- Responsive mobile menu
- Hover state animations

**Usage:**

```tsx
<Navigation />
```

---

### Hero (`hero.tsx`)

Massive hero section with "Intelligence Awakens" headline.

**Features:**

- Mouse-reactive gradient glow
- Floating ambient orbs (pulse animation)
- Animated grid background
- Glass card with live stats
- Smooth scroll indicator

**Customization:**

```tsx
// Update headline (line ~70)
<h1>Your Headline</h1>

// Update stats (line ~130)
{ label: "Your Metric", value: "123", trend: "+10%" }
```

---

### Intelligence (`intelligence.tsx`)

Showcases system capabilities with animated cards.

**Features:**

- 4 capability cards with icons
- Scroll-triggered fade-in
- Hover scale + glow effects
- Terminal UI mockup
- Scroll-based opacity transforms

**Customization:**

```tsx
// Update capabilities (line ~8)
const capabilities = [
  {
    icon: YourIcon,
    title: "Your Title",
    description: "Your description",
  },
];
```

---

### Experience (`experience.tsx`)

Step-by-step journey through the system.

**Features:**

- 4 numbered steps
- Vertical connecting line
- Animated progress bars
- Scroll-triggered reveals
- Stats showcase card

**Customization:**

```tsx
// Update steps (line ~8)
const steps = [
  {
    title: "Your Step",
    description: "Your description",
  },
];
```

---

### Features (`features.tsx`)

Bento grid layout with variable card sizes.

**Features:**

- 8 feature cards
- Variable sizes (some 2x2)
- Hover-reactive glows
- Staggered entrance animations
- Performance metrics display

**Customization:**

```tsx
// Update features (line ~12)
const features = [
  {
    icon: YourIcon,
    title: "Your Feature",
    description: "Your description",
  },
];

// Control large cards (line ~87)
const isLarge = index === 0 || index === 3;
```

---

### Final CTA (`final-cta.tsx`)

Email capture with massive visual impact.

**Features:**

- Massive radial glow (1200px)
- Email input form
- Rotating background pattern
- Trust indicators
- Logo placeholders

**Customization:**

```tsx
// Update headline (line ~70)
<h2>Your Headline</h2>;

// Update features (line ~110)
["Feature 1", "Feature 2", "Feature 3", "Feature 4"];
```

---

### Cursor Glow (`cursor-glow.tsx`)

Custom cursor trail effect with spring physics.

**Features:**

- Layered glow (2 sizes)
- Spring-based smooth motion
- Mix-blend-screen for effect
- Auto-hide on mouse leave

**Customization:**

```tsx
// Adjust spring physics (line ~13)
const springConfig = { damping: 25, stiffness: 200 };

// Change glow size (line ~35)
className = "w-96 h-96"; // Main glow
className = "w-48 h-48"; // Secondary glow
```

---

### Floating Particles (`floating-particles.tsx`)

Ambient particle effects floating upward.

**Features:**

- 20 particles by default
- Random positioning
- Upward float animation
- Fade in/out effect

**Customization:**

```tsx
// Change particle count (line ~6)
const particles = Array.from({ length: 30 }, ...)

// Adjust animation speed (line ~9)
duration: Math.random() * 15 + 8,  // 8-23s range
```

---

### System Status (`system-status.tsx`)

Live status indicator in bottom-right corner.

**Features:**

- Pulsing status dot
- Ripple effect
- Glass morphism card
- Desktop-only display

**Customization:**

```tsx
// Change position (line ~10)
className="fixed bottom-6 right-6"

// Update status text (line ~40)
<div>Your Status</div>
```

---

## 🎨 Design Patterns

### Card Pattern

```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -5 }}
  className="rounded-[3px] border-2 border-primary/20 bg-gradient-to-br from-[#1A0F0F]/80 to-[#0A0505]/80 backdrop-blur-xl p-8"
>
  {/* Content */}
</motion.div>
```

### Entrance Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false, amount: 0.3 }}
  transition={{ duration: 0.8 }}
>
  {/* Content */}
</motion.div>
```

### Glow Effect

```tsx
<div className="relative">
  {/* Content */}
  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent blur-3xl -z-10" />
</div>
```

### Badge Pattern

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
  <span className="text-xs font-bold uppercase tracking-widest text-primary">
    Your Badge
  </span>
</div>
```

## 🎯 Common Customizations

### Change Animation Speed

```tsx
// Slower
transition={{ duration: 1.2 }}

// Faster
transition={{ duration: 0.4 }}
```

### Adjust Glow Intensity

```tsx
// Stronger
className = "bg-primary/30 blur-[150px]";

// Subtler
className = "bg-primary/10 blur-[60px]";
```

### Modify Hover Effect

```tsx
// More dramatic
whileHover={{ scale: 1.05, y: -10 }}

// Subtler
whileHover={{ scale: 1.01, y: -2 }}
```

### Change Stagger Timing

```tsx
// Faster stagger
transition={{ delay: index * 0.05 }}

// Slower stagger
transition={{ delay: index * 0.2 }}
```

## 🚀 Performance Tips

1. **Use `once: true`** for one-time animations:

```tsx
viewport={{ once: true }}
```

2. **Reduce particles** on mobile:

```tsx
const particles = Array.from({
  length: isMobile ? 10 : 20
}, ...)
```

3. **Disable cursor glow** on touch devices:

```tsx
{
  !isTouchDevice && <CursorGlow />;
}
```

4. **Lazy load sections**:

```tsx
viewport={{ once: true, amount: 0.3 }}
```

## 📱 Responsive Patterns

### Hide on Mobile

```tsx
className = "hidden lg:block";
```

### Different Layouts

```tsx
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
```

### Responsive Text

```tsx
className = "text-5xl md:text-6xl lg:text-7xl";
```

### Responsive Spacing

```tsx
className = "px-4 md:px-6 lg:px-8";
```

## 🎨 Color Utilities

### Primary Gradient

```tsx
className = "bg-gradient-to-r from-primary via-red-400 to-primary";
```

### Glass Effect

```tsx
className = "bg-[#1A0F0F]/80 backdrop-blur-xl";
```

### Border Glow

```tsx
className = "border-2 border-primary/20 hover:border-primary/40";
```

### Text Gradient

```tsx
className =
  "bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent";
```

## 🔧 Troubleshooting

### Animations not smooth?

- Check GPU acceleration (use transform/opacity)
- Reduce blur intensity
- Use `will-change` sparingly

### Glows not visible?

- Increase opacity: `bg-primary/30`
- Increase blur: `blur-[150px]`
- Check z-index layering

### Scroll animations firing too early?

- Adjust viewport amount: `amount: 0.5`
- Use `margin` in viewport config

### Mobile performance issues?

- Reduce particle count
- Disable cursor glow
- Use `once: true` for animations
- Simplify blur effects

## 📚 Resources

- [Framer Motion API](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

## 🎉 Component Checklist

- ✅ Navigation - Fixed header with glass effect
- ✅ Hero - Mouse-reactive with floating orbs
- ✅ Intelligence - Capability cards with terminal
- ✅ Experience - Step-by-step journey
- ✅ Features - Bento grid layout
- ✅ Final CTA - Email capture with impact
- ✅ Cursor Glow - Custom cursor trail
- ✅ Floating Particles - Ambient effects
- ✅ System Status - Live indicator

All components are production-ready and fully responsive.
