# hasnat.ops — Operations Console Portfolio

An Awwwards-grade interactive portfolio designed as a live operations console into the career of Hasnat Ahmed. This is not a traditional portfolio—it's a system you *operate*, with every page representing a different subsystem of one running machine.

## 🎨 Concept

**hasnat.ops** reimagines the portfolio as a **deep-space operations interface**:
- **Home (`/`)**: Boot sequence into the cluster hero—system introduction
- **About (`/about`)**: Operator profile, skills map, and values
- **Work (`/work`)**: Deployment registry (project index)
- **Case Studies (`/work/[slug]`)**: Deep-dive inspection per deployment
- **Experience (`/experience`)**: Career event log with animated timeline
- **Lab (`/lab`)**: Sandbox for experiments and easter eggs
- **Contact (`/contact`)**: Uplink for reaching the operator

Every page speaks in infrastructure language—clean, precise, system-flavored—but never at the expense of clarity. Real metrics from the resume become system telemetry.

## ✨ Features

- **3D WebGL Scenes**: Purpose-driven visualizations for each section
  - **Cluster**: Node graph representing actual infrastructure
  - **Latent Field**: Particle animation for AI/latent-space concepts
  - **Pipeline**: Data-stream transition visualization
  - **Deployment**: Scene variants for each project

- **Terminal Interface**: Full-featured interactive terminal with command palette (⌘K / Ctrl+K)
  - Real navigation tied to terminal state
  - Easter eggs and system commands
  - Fully typed command system

- **Smooth Motion & Scroll**: 
  - GSAP + Lenis scroll choreography
  - Page transitions with motion boundaries
  - Synchronized 3D staging with scroll

- **Design System**:
  - Deep-space color palette (cyan, amber, violet accents on charcoal base)
  - Phosphor-white text with fine grain texture
  - Responsive variable typography (Geist + Geist Mono)
  - Dark mode–first, accessibility-first

- **Performance Optimized**:
  - Server-side rendering (Next.js RSC)
  - Lazy-loaded 3D scenes with suspend boundaries
  - DPR-capped WebGL, visibility-driven pause
  - Static generation where possible

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15.x (App Router, React 19.x) |
| **Language** | TypeScript 5.x |
| **3D Graphics** | three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing |
| **Motion** | GSAP 3.13 + ScrollTrigger, Lenis, motion 12 |
| **Styling** | Tailwind CSS v4 + CSS custom properties |
| **State Management** | Zustand 5.x |
| **Content** | Typed TypeScript modules in `/content` |
| **API** | Next.js Route Handlers (Zod validation, rate limiting) |
| **Deployment** | Docker + Vercel |
| **Quality** | ESLint, Prettier, @axe-core/react |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm/pnpm/yarn
- Docker (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone git@github.com:Hasnat-Ahmed-Goheer/portfolio-hasnat-ops.git
cd portfolio-hasnat-ops

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

The development server includes:
- Hot module reloading
- Fast refresh for React components
- TypeScript checking
- Tailwind CSS compilation

### Building for Production

```bash
# Build the project
npm run build

# Start the production server
npm start
```

### Docker

```bash
# Build the Docker image
docker build -t hasnat-ops .

# Run the container
docker run -p 3000:3000 hasnat-ops
```

Or use Docker Compose:

```bash
docker-compose up
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout, providers, chrome
│   ├── template.tsx             # Page transition boundary
│   ├── page.tsx                 # Home (boot sequence + cluster)
│   ├── about/page.tsx           # Operator profile
│   ├── work/page.tsx            # Deployment registry
│   ├── work/[slug]/page.tsx     # Case study deep-dive
│   ├── experience/page.tsx      # Career timeline
│   ├── lab/page.tsx             # Sandbox experiments
│   ├── contact/page.tsx         # Contact form
│   ├── api/contact/route.ts     # Contact endpoint
│   └── [sitemap, robots, og-image, 404]
├── components/
│   ├── chrome/                  # Global UI chrome
│   │   ├── Nav.tsx              # Navigation bar
│   │   ├── Footer.tsx           # Footer
│   │   ├── Cursor.tsx           # Custom cursor
│   │   ├── ScrollProgress.tsx   # Scroll indicator
│   │   └── ...
│   ├── terminal/                # Terminal UI
│   │   ├── Terminal.tsx         # Terminal component
│   │   ├── BootSequence.tsx     # Startup animation
│   │   └── ...
│   ├── sections/                # Per-page sections
│   │   ├── HomeSections.tsx
│   │   ├── AboutSections.tsx
│   │   └── ...
│   └── ui/                      # Primitive components
│       ├── Reveal.tsx           # Text reveal animation
│       ├── Magnetic.tsx         # Magnetic cursor effect
│       └── ...
├── scenes/                      # WebGL/Three.js scenes
│   ├── CanvasRoot.tsx          # Persistent canvas root
│   ├── cluster/                # Node cluster scene
│   ├── latent/                 # Latent-space particles
│   ├── pipeline/               # Data pipeline viz
│   ├── deployment/             # Project-specific scenes
│   └── shared/                 # Shared effects & utilities
├── content/                     # Typed content data
│   ├── profile.ts              # Personal profile
│   ├── projects.ts             # Project definitions
│   ├── experience.ts           # Career timeline
│   ├── skills.ts               # Skills map
│   └── types.ts                # Content types
├── config/                      # Configuration
│   ├── theme.ts                # Design tokens (colors, type scale, spacing)
│   └── console.ts              # Terminal & scene config
├── stores/                      # Zustand stores
│   ├── terminalStore.ts        # Terminal state
│   ├── sceneStore.ts           # Scene routing
│   └── uiStore.ts              # Global UI state
└── lib/                         # Utilities
    ├── motion.ts               # Motion helpers
    ├── a11y.ts                 # Accessibility utilities
    ├── commands.ts             # Terminal commands
    └── ...

public/                         # Static assets
Dockerfile                      # Container config
docker-compose.yml             # Docker Compose config
next.config.ts                 # Next.js configuration
tsconfig.json                  # TypeScript configuration
tailwind.config.ts             # Tailwind CSS configuration
postcss.config.mjs             # PostCSS configuration
```

## ⚙️ Configuration

Two main configuration files control the entire system:

### `src/config/theme.ts`
All design tokens: colors, typography scale, spacing, radii, visual effects (grain, bloom).

### `src/config/console.ts`
Terminal lexicon (`"deployment"`, `"SYS://"`, boot lines, status verbs), scene presets, and parameter tuning.

**To reskin the portfolio**: Edit these two files + `/src/content`. No component restructuring needed.

## 📝 Environment Variables

Create a `.env.local` file in the root:

```bash
# Contact form API (Resend or SMTP)
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
# Optional: Resend API key
RESEND_API_KEY=your-resend-key

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-ga-id
```

## 🔗 Deployment

### Vercel (Recommended)

```bash
# Connect your GitHub repository to Vercel and push
git push origin main

# Vercel will auto-deploy on push
```

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the `.next` folder to your hosting provider
```

## 📊 Performance

- **Core Web Vitals**: Optimized for Largest Contentful Paint, First Input Delay, Cumulative Layout Shift
- **WebGL Optimization**: DPR capping, visibility pause, scene disposal
- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js `<Image />` component
- **CSS**: Purged and minified Tailwind CSS

## ♿ Accessibility

- Semantic HTML throughout
- ARIA labels and roles where needed
- Keyboard navigation for all interactive elements
- Terminal accessible via keyboard (⌘K / Ctrl+K)
- Color contrast ratios meet WCAG AA standards
- Dev-time checks with `@axe-core/react`

## 🧪 Quality

- **Linting**: ESLint with Next.js recommended config
- **Formatting**: Prettier for code consistency
- **Type Safety**: Full TypeScript with strict mode
- **Lighthouse**: CI script for performance monitoring

## 🎓 Key Concepts

### Swappability
The entire design and terminology system lives in config files. Retuning the metaphor (changing from "deployment" to "project", adjusting colors, tweaking motion) is a config-only change.

### Scene-Scoped Styling
Each 3D scene is visually distinct:
- **Cluster**: Cyan nodes (career infrastructure)
- **Latent**: Violet particles (AI/LLM work)
- **Pipeline**: Cyan flows (data pipelines)
- **Deployment**: Per-project color variants

### Terminal-as-Navigation
The terminal is a real navigation system tied to state, not just visual sugar. Every terminal command has a clickable equivalent. Terminal is additive, never required.

## 📄 License

© 2025 Hasnat Ahmed. All rights reserved.

---

**Built with** ❤️ **using Next.js, Three.js, GSAP, and Tailwind CSS**
