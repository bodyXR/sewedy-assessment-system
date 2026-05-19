# Landing Page Quick Start

## 🚀 View the Landing Page

The landing page is now the **default homepage**!

Navigate to: **`http://localhost:3000/`** or **`http://localhost:3000/landing`**

## 🔗 Navigation Flow

- **Homepage** (`/`) - Premium landing page
- **Sign In** button → `/login`
- **Get Started** / **Enter the System** buttons → `/dashboard`
- **Logo** click → Returns to `/` (homepage)

## 📁 File Structure

```
app/landing/
└── page.tsx                          # Main landing page

components/landing/
├── cursor-glow.tsx                   # Mouse-reactive glow effect
├── experience.tsx                    # Experience section with steps
├── features.tsx                      # Features bento grid
├── final-cta.tsx                     # Final call-to-action
├── floating-particles.tsx            # Ambient particle effects
├── hero.tsx                          # Hero section
├── intelligence.tsx                  # Intelligence/capabilities section
├── navigation.tsx                    # Fixed navigation header
└── system-status.tsx                 # Live system status indicator
```

## 🎨 Key Features

### Visual Effects

- ✨ Mouse-reactive cursor glow
- 🌊 Floating ambient particles
- 💫 Smooth scroll-triggered animations
- 🔮 Glass morphism cards
- 🌟 Radial gradient glows
- 📊 Animated statistics
- 🎭 Hover state transformations

### Sections

1. **Hero** - Massive headline with interactive preview
2. **Intelligence** - System capabilities showcase
3. **Experience** - Step-by-step journey
4. **Features** - Bento grid layout
5. **Final CTA** - Email capture with trust signals

### Interactive Elements

- Smooth scroll navigation
- Responsive mobile menu
- Hover-reactive cards
- Scroll-based parallax
- Live system status indicator

## 🎯 Customization Guide

### Change Colors

Edit `app/globals.css`:

```css
--primary: 350 85% 55%; /* Main red color */
--background: 0 0% 4%; /* Dark background */
```

### Update Content

**Hero Section** (`components/landing/hero.tsx`):

```typescript
// Line ~70
<h1>Intelligence Awakens</h1>
<p>Your description here...</p>
```

**Stats** (`components/landing/hero.tsx`):

```typescript
// Line ~130
{ label: "Active Assessments", value: "2,847", trend: "+12%" }
```

**Capabilities** (`components/landing/intelligence.tsx`):

```typescript
// Line ~8
const capabilities = [
  {
    icon: Brain,
    title: "Your Title",
    description: "Your description",
  },
  // Add more...
];
```

**Features** (`components/landing/features.tsx`):

```typescript
// Line ~12
const features = [
  {
    icon: Activity,
    title: "Your Feature",
    description: "Description",
  },
  // Add more...
];
```

### Adjust Animation Speed

**Slower animations**:

```typescript
transition={{ duration: 1.2, delay: 0.5 }}
```

**Faster animations**:

```typescript
transition={{ duration: 0.4 }}
```

**Change spring physics**:

```typescript
const springConfig = { damping: 30, stiffness: 200 };
```

### Modify Glow Intensity

**Stronger glow**:

```typescript
className="bg-primary/30"  // Increase opacity
blur-[150px]               // Increase blur
```

**Subtler glow**:

```typescript
className="bg-primary/10"  // Decrease opacity
blur-[60px]                // Decrease blur
```

## 🎬 Animation Patterns

### Fade In on Scroll

```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false, amount: 0.3 }}
  transition={{ duration: 0.8 }}
>
  Your content
</motion.div>
```

### Hover Effect

```typescript
<motion.div
  whileHover={{ scale: 1.02, y: -5 }}
  transition={{ duration: 0.3 }}
>
  Your card
</motion.div>
```

### Staggered Children

```typescript
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

## 📱 Responsive Design

The landing page is fully responsive:

- **Mobile** (< 768px): Single column, simplified animations
- **Tablet** (768px - 1024px): 2-column grids
- **Desktop** (> 1024px): Full experience

Test breakpoints:

```typescript
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
```

## 🎨 Design Tokens

### Spacing Scale

```
px-6   = 24px   (Mobile padding)
py-32  = 128px  (Section vertical spacing)
gap-4  = 16px   (Small gaps)
gap-6  = 24px   (Medium gaps)
gap-8  = 32px   (Large gaps)
```

### Typography Scale

```
text-xs    = 12px   (Labels)
text-sm    = 14px   (Body small)
text-base  = 16px   (Body)
text-xl    = 20px   (Lead)
text-2xl   = 24px   (Subheading)
text-5xl   = 48px   (Heading)
text-7xl   = 72px   (Hero)
```

### Border Radius

```
rounded-[3px]  = Sharp, minimal (brand style)
rounded-full   = Pills and circles
```

## 🔧 Troubleshooting

### Animations not working?

- Check Framer Motion is installed: `pnpm install framer-motion`
- Ensure components are client-side: `"use client"` at top

### Blur effects not showing?

- Check browser support for `backdrop-filter`
- Try increasing blur values: `blur-xl` → `blur-3xl`

### Performance issues?

- Reduce number of particles in `floating-particles.tsx`
- Disable cursor glow on mobile
- Use `once: true` in viewport animations

### Scroll not smooth?

- Check `document.documentElement.style.scrollBehavior = "smooth"`
- Ensure anchor IDs match navigation hrefs

## 🚀 Performance Tips

1. **Optimize images**: Use WebP/AVIF format
2. **Lazy load**: Use `viewport={{ once: true }}` for one-time animations
3. **Reduce motion**: Respect `prefers-reduced-motion`
4. **GPU acceleration**: Stick to transform/opacity animations
5. **Debounce scroll**: Framer Motion handles this automatically

## 📊 Analytics Integration

Add tracking to key interactions:

```typescript
<Button
  onClick={() => {
    // Your analytics
    console.log('CTA clicked');
  }}
>
  Get Started
</Button>
```

## 🎯 Next Steps

1. **Add real data**: Replace mock stats with live data
2. **Connect forms**: Wire up email capture to your backend
3. **Add testimonials**: Create a testimonials section
4. **Implement auth**: Connect "Sign In" and "Get Started" buttons
5. **A/B testing**: Test different headlines and CTAs
6. **SEO**: Add meta tags, Open Graph, structured data
7. **Analytics**: Track scroll depth, CTA clicks, time on page

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🎨 Design Inspiration

The landing page draws inspiration from:

- Apple product pages (premium feel)
- Linear (motion quality)
- Stripe (atmospheric depth)
- Vercel (clean minimalism)
- Sci-fi interfaces (futuristic aesthetic)

But maintains a unique "cognitive intelligence" identity.
