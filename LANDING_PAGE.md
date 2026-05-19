# Premium Landing Page

A cinematic, AI-inspired landing page built with Next.js, Framer Motion, and Tailwind CSS.

## 🎨 Design Philosophy

The landing page embodies:

- **Cognitive Intelligence**: Feels like an AI system awakening
- **Deep-Tech Luxury**: Premium, sophisticated, futuristic
- **Calm Futurism**: Believable future, not cyberpunk
- **Immersive Experience**: Rich but minimalistic, interactive but usable

## 🏗️ Structure

### Components

1. **Navigation** (`components/landing/navigation.tsx`)
   - Fixed header with scroll-based backdrop blur
   - Smooth scroll navigation
   - Mobile-responsive menu

2. **Hero** (`components/landing/hero.tsx`)
   - Mouse-reactive gradient effects
   - Floating ambient orbs with animations
   - Animated grid background
   - Interactive glass card preview
   - Smooth scroll indicator

3. **Intelligence Section** (`components/landing/intelligence.tsx`)
   - Capability cards with hover effects
   - Scroll-triggered animations
   - Mock terminal UI showcase
   - Parallax scroll effects

4. **Experience Section** (`components/landing/experience.tsx`)
   - Scroll-driven storytelling
   - Numbered step progression
   - Animated progress bars
   - Stats showcase card

5. **Features Grid** (`components/landing/features.tsx`)
   - Bento-grid inspired layout
   - Variable card sizes for visual interest
   - Hover-reactive glows
   - Performance metrics display

6. **Final CTA** (`components/landing/final-cta.tsx`)
   - Massive radial glow effects
   - Email capture form
   - Animated background patterns
   - Trust indicators

7. **Cursor Glow** (`components/landing/cursor-glow.tsx`)
   - Custom cursor trail effect
   - Layered glow with different blur levels
   - Smooth spring animations

## 🎭 Motion Language

### Principles

- **Fluid & Intelligent**: Smooth spring animations (damping: 25, stiffness: 150-200)
- **Layered Depth**: Multiple blur levels (60px, 80px, 100px, 120px, 200px)
- **Subtle Entrance**: Fade + translate animations (0.6-0.8s duration)
- **Reactive Hover**: Scale (1.02-1.03) + translate (-5px) on hover
- **Scroll-Driven**: useScroll + useTransform for parallax effects

### Animation Patterns

```typescript
// Standard entrance
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}

// Hover interaction
whileHover={{ scale: 1.02, y: -5 }}

// Scroll parallax
const y = useTransform(scrollYProgress, [0, 1], [100, -100])
```

## 🎨 Visual System

### Color Palette

- **Background**: `#0A0505` (deep dark red-black)
- **Primary**: `hsl(350 85% 55%)` (luxury red)
- **Accents**: Gradients from primary to red-400
- **Text**: White to gray-400 hierarchy

### Typography

- **Font**: Inter with advanced features (cv02, cv03, cv04, cv11)
- **Hierarchy**:
  - Hero: 6xl-8xl (96-128px)
  - Section Headers: 5xl-6xl (48-72px)
  - Body: xl-2xl (20-24px)
  - Labels: xs uppercase tracking-widest

### Spacing

- **Section Padding**: py-32 (128px vertical)
- **Container Max Width**: 7xl (1280px)
- **Grid Gaps**: 4-6 (16-24px)
- **Card Padding**: p-8 to p-16 (32-64px)

### Effects

- **Glass Morphism**: `backdrop-blur-xl` with gradient backgrounds
- **Borders**: 2px solid with primary/20-30 opacity
- **Border Radius**: `rounded-[3px]` (sharp, minimal)
- **Shadows**: Layered blur effects instead of traditional shadows
- **Glows**: Radial gradients with blur-[60px] to blur-[200px]

## 🚀 Usage

### Access the Landing Page

Navigate to `/landing` in your browser.

### Customization

#### Update Colors

Edit `app/globals.css` CSS variables:

```css
--primary: 350 85% 55%;
--background: 0 0% 4%;
```

#### Modify Content

Each section component is self-contained. Update text, stats, and features directly in:

- `components/landing/hero.tsx`
- `components/landing/intelligence.tsx`
- `components/landing/experience.tsx`
- `components/landing/features.tsx`
- `components/landing/final-cta.tsx`

#### Adjust Animations

Framer Motion configs are inline. Common patterns:

```typescript
// Slower, more dramatic
transition={{ duration: 1.2, delay: 0.3 }}

// Faster, snappier
transition={{ duration: 0.4 }}

// Custom spring
const springConfig = { damping: 30, stiffness: 200 };
```

## 🎯 Performance

### Optimizations

- GPU-accelerated transforms (translate, scale, opacity)
- `will-change` handled by Framer Motion
- Lazy viewport detection with `useInView`
- Scroll progress calculated only when needed
- Smooth spring animations prevent jank

### Best Practices

- All animations use transform/opacity (no layout thrashing)
- Blur effects are layered strategically
- Images should be optimized (WebP/AVIF)
- Consider reducing motion for accessibility

## 📱 Responsive Design

- **Mobile**: Single column, reduced font sizes, simplified animations
- **Tablet**: 2-column grids, medium spacing
- **Desktop**: Full experience with all effects

Breakpoints:

- `md:` 768px
- `lg:` 1024px

## 🎨 Design Tokens

### Blur Levels

- Subtle: `blur-xl` (24px)
- Medium: `blur-2xl` (40px)
- Heavy: `blur-3xl` (64px)
- Extreme: `blur-[100px]` to `blur-[200px]`

### Glow Sizes

- Small: w-48 h-48
- Medium: w-96 h-96
- Large: w-[600px] h-[600px]
- Massive: w-[1200px] h-[1200px]

### Animation Durations

- Quick: 0.3-0.4s
- Standard: 0.6-0.8s
- Slow: 1.0-1.2s
- Ambient: 8-20s (infinite loops)

## 🔮 Future Enhancements

Potential additions:

- WebGL background with Three.js
- Particle system effects
- Video backgrounds
- Interactive 3D elements
- Real-time data visualization
- Sound design integration
- Advanced scroll-jacking
- Custom WebGL shaders

## 📄 License

Part of the Assessor platform.
