# Hero Component Options

## ✨ Two Hero Versions Available

### 1. Static Dot Grid (Current - Default)

**File:** `components/landing/hero.tsx`

**Features:**

- Clean, minimalistic design
- Static dot grid background
- Centered layout
- Stats bar at bottom
- Best performance
- Professional and calm

**Background Component:** `components/ui/dot-grid.tsx`

---

### 2. Animated Dot Grid (Interactive)

**File:** `components/landing/hero-animated.tsx`

**Features:**

- Interactive dot grid
- Mouse-reactive dots (grow and brighten near cursor)
- Same layout as static version
- Subtle animation
- More engaging
- Slightly more resource-intensive

**Background Component:** `components/ui/animated-dot-grid.tsx`

---

## 🔄 How to Switch

### To use the Animated version:

Edit `app/page.tsx`:

```typescript
// Change this line:
import { Hero } from "@/components/landing/hero";

// To this:
import { Hero } from "@/components/landing/hero-animated";
```

Or rename the component:

```typescript
import { HeroAnimated as Hero } from "@/components/landing/hero-animated";
```

---

## 🎨 Customization Options

### Dot Grid Settings

Both components accept these props:

```typescript
<DotGrid
  dotSize={1}           // Size of each dot (1-3 recommended)
  gap={32}              // Space between dots (24-48 recommended)
  dotColor="rgba(0, 0, 0, 0.08)"  // Dot color with opacity
/>
```

### Animated Dot Grid Additional Settings

```typescript
<AnimatedDotGrid
  dotSize={1}
  gap={32}
  dotColor="rgba(0, 0, 0, 0.1)"
  mouseEffect={true}    // Enable/disable mouse interaction
/>
```

---

## 🎯 Recommended Configurations

### Subtle & Professional (Current)

```typescript
dotSize={1}
gap={32}
dotColor="rgba(0, 0, 0, 0.08)"
```

### More Visible

```typescript
dotSize={1.5}
gap={28}
dotColor="rgba(0, 0, 0, 0.12)"
```

### Minimal

```typescript
dotSize={0.5}
gap={40}
dotColor="rgba(0, 0, 0, 0.05)"
```

### Dense Grid

```typescript
dotSize={1}
gap={20}
dotColor="rgba(0, 0, 0, 0.06)"
```

---

## 🎨 Alternative Background Patterns

You can also create other React Bits-style backgrounds:

### 1. Line Grid

```typescript
<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
```

### 2. Radial Gradient

```typescript
<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00000008_1px,transparent_1px)] bg-[size:32px_32px]" />
```

### 3. Diagonal Lines

```typescript
<div className="absolute inset-0 bg-[linear-gradient(45deg,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
```

---

## 📊 Performance Comparison

| Feature         | Static     | Animated   |
| --------------- | ---------- | ---------- |
| Performance     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |
| Engagement      | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| Mobile-friendly | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |
| Battery impact  | None       | Minimal    |

---

## 💡 Recommendations

**Use Static Dot Grid if:**

- You want maximum performance
- Targeting mobile-first
- Prefer minimal resource usage
- Want a calm, professional feel

**Use Animated Dot Grid if:**

- You want subtle interactivity
- Desktop is primary target
- Want to add engagement
- Okay with slight performance trade-off

---

## 🔧 Current Setup

**Active Hero:** Static Dot Grid (`components/landing/hero.tsx`)

**To switch to animated:**

1. Open `app/page.tsx`
2. Change import from `hero` to `hero-animated`
3. Save and refresh

---

## 🎨 Visual Style

Both versions maintain:

- ✅ Minimalistic design
- ✅ Centered layout
- ✅ Professional typography
- ✅ Clean spacing
- ✅ Subtle gradients
- ✅ Stats bar
- ✅ Responsive design

The only difference is the background interactivity.
