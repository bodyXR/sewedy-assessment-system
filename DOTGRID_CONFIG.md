# DotGrid Configuration Guide

## ✨ React Bits DotGrid Component

The hero now uses the **actual React Bits DotGrid** component with GSAP physics-based animations!

## 🎮 Interactive Features

- **Mouse Proximity**: Dots change color when mouse is near
- **Shock Wave**: Dots push away from cursor with elastic bounce-back
- **Smooth Physics**: GSAP-powered animations with elastic easing
- **Color Transitions**: Smooth fade between base and active colors

## ⚙️ Current Configuration

```typescript
<DotGrid
  dotSize={3}              // Size of each dot in pixels
  gap={24}                 // Space between dots
  baseColor="#E5E7EB"      // Default dot color (gray-200)
  activeColor="#C72E3D"    // Active dot color (primary red)
  proximity={100}          // Distance for color change effect
  shockRadius={200}        // Distance for displacement effect
  shockStrength={8}        // How far dots move away
  resistance={750}         // Resistance to movement (unused in current impl)
  returnDuration={1.5}     // Time to return to original position
/>
```

## 🎨 Preset Configurations

### 1. Subtle & Professional (Current)

```typescript
dotSize={3}
gap={24}
baseColor="#E5E7EB"
activeColor="#C72E3D"
proximity={100}
shockRadius={200}
shockStrength={8}
returnDuration={1.5}
```

**Feel:** Calm, professional, minimal interaction

---

### 2. More Interactive

```typescript
dotSize={4}
gap={20}
baseColor="#D1D5DB"
activeColor="#C72E3D"
proximity={120}
shockRadius={250}
shockStrength={12}
returnDuration={1.2}
```

**Feel:** More responsive, engaging

---

### 3. Minimal & Elegant

```typescript
dotSize={2}
gap={30}
baseColor="#F3F4F6"
activeColor="#C72E3D"
proximity={80}
shockRadius={150}
shockStrength={5}
returnDuration={2.0}
```

**Feel:** Very subtle, refined

---

### 4. Bold & Playful

```typescript
dotSize={5}
gap={18}
baseColor="#E5E7EB"
activeColor="#C72E3D"
proximity={140}
shockRadius={280}
shockStrength={15}
returnDuration={1.0}
```

**Feel:** More dramatic, fun

---

### 5. Dense Grid

```typescript
dotSize={2}
gap={16}
baseColor="#E5E7EB"
activeColor="#C72E3D"
proximity={90}
shockRadius={180}
shockStrength={6}
returnDuration={1.5}
```

**Feel:** More dots, tighter pattern

---

## 🎯 Parameter Guide

### `dotSize` (number)

- **Range:** 1-6 pixels
- **Recommended:** 2-4
- **Effect:** Larger = more visible, smaller = more subtle

### `gap` (number)

- **Range:** 12-40 pixels
- **Recommended:** 20-30
- **Effect:** Smaller = denser grid, larger = more spacious

### `baseColor` (string)

- **Format:** Hex color code
- **Recommended:** Light grays (#E5E7EB, #D1D5DB, #F3F4F6)
- **Effect:** Default dot color

### `activeColor` (string)

- **Format:** Hex color code
- **Recommended:** Brand color (#C72E3D for primary red)
- **Effect:** Color when mouse is near

### `proximity` (number)

- **Range:** 50-150 pixels
- **Recommended:** 80-120
- **Effect:** Distance at which dots start changing color

### `shockRadius` (number)

- **Range:** 100-300 pixels
- **Recommended:** 180-250
- **Effect:** Distance at which dots start moving

### `shockStrength` (number)

- **Range:** 3-20 pixels
- **Recommended:** 6-12
- **Effect:** How far dots move away from cursor

### `returnDuration` (number)

- **Range:** 0.5-3.0 seconds
- **Recommended:** 1.0-2.0
- **Effect:** How long dots take to return (with elastic bounce)

---

## 🎨 Color Schemes

### Professional Gray (Current)

```typescript
baseColor = "#E5E7EB"; // gray-200
activeColor = "#C72E3D"; // primary red
```

### Lighter

```typescript
baseColor = "#F3F4F6"; // gray-100
activeColor = "#C72E3D";
```

### Darker

```typescript
baseColor = "#D1D5DB"; // gray-300
activeColor = "#C72E3D";
```

### Blue Accent

```typescript
baseColor = "#E5E7EB";
activeColor = "#3B82F6"; // blue-500
```

### Purple Accent

```typescript
baseColor = "#E5E7EB";
activeColor = "#8B5CF6"; // purple-500
```

---

## 🔧 How to Customize

Edit `components/landing/hero.tsx`:

```typescript
<DotGrid
  dotSize={3}              // Change these values
  gap={24}
  baseColor="#E5E7EB"
  activeColor="#C72E3D"
  proximity={100}
  shockRadius={200}
  shockStrength={8}
  returnDuration={1.5}
/>
```

---

## 📱 Performance Notes

**Desktop:**

- Smooth 60fps animation
- GSAP handles optimization
- No performance issues

**Mobile:**

- Works well on modern devices
- Consider reducing `shockStrength` for battery
- May want to disable on very old devices

**Optimization Tips:**

- Increase `gap` to reduce dot count
- Decrease `shockRadius` to affect fewer dots
- Increase `returnDuration` for less frequent updates

---

## 🎭 Animation Details

**Color Transition:**

- CSS transition: 0.3s ease
- Smooth fade between colors
- Opacity changes with proximity

**Displacement:**

- GSAP animation: 0.3s power2.out
- Elastic return: 1.5s elastic.out(1, 0.3)
- Physics-based movement

**Mouse Leave:**

- All dots return to original position
- Reset to base color
- Elastic bounce effect

---

## 🚀 Advanced Customization

Want different behavior? Edit `components/ui/DotGrid.tsx`:

**Change elastic bounce:**

```typescript
ease: "elastic.out(1, 0.5)"; // More bouncy
ease: "elastic.out(1, 0.1)"; // Less bouncy
```

**Change displacement easing:**

```typescript
ease: "power2.out"; // Current (smooth)
ease: "power4.out"; // Snappier
ease: "expo.out"; // Very smooth
```

**Add rotation:**

```typescript
gsap.to(dot.element, {
  x: offsetX,
  y: offsetY,
  rotation: force * 10, // Add rotation
  duration: 0.3,
});
```

---

## ✅ Current Status

- ✅ GSAP installed
- ✅ DotGrid component created
- ✅ Hero updated with interactive dots
- ✅ Professional gray color scheme
- ✅ Smooth physics animations
- ✅ Responsive to mouse movement

**The hero now has that premium React Bits feel with interactive physics-based dots!** 🎨
