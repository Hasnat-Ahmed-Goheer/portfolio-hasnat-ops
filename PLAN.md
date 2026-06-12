# PLAN.md — "HASNAT://OPS" — Phase 0 Plan
### Awwwards-grade portfolio for Hasnat Ahmed — Operations Console concept
*Status: awaiting approval. No feature code written.*

---

## A. Creative Direction

**Working title:** `hasnat.ops` — the portfolio is a live operations console into Hasnat's career. You don't read it; you *operate* it. Every page is a subsystem of one running machine: the cluster (who's running), the registry (what's deployed), the event log (what happened), the sandbox (what's experimental), the uplink (how to reach the operator).

**Voice & copy register.** Calm, precise, infrastructure-flavored. Section labels read like console output (`SYS://CLUSTER`, `status: operational`, `uptime: 2+ yrs`), but body copy stays human — the console framing is seasoning, never a gimmick that obscures content. Real metrics from the resume (60% auth-code reduction, 15+ environments, sub-200ms latency) become "system telemetry."

**Art direction — Deep-Space Ops.**

- Base: near-black blue-charcoal (`#0A0E14` family), subtle blue-grain nebula in WebGL backgrounds.
- Primary signal: cyan/teal (`#22D3EE` family) — healthy, running, interactive.
- Secondary: amber (`#F59E0B` family) — warnings, hover states, easter eggs.
- Tertiary: violet (`#8B5CF6` family) — AI/latent-space scenes only (scene-scoped, keeps scenes visually distinct).
- Text: phosphor off-white (`#E6EDF3`), muted slate for metadata.
- Type: one variable grotesk for display/UI (e.g. **Geist** or **Space Grotesk** variable), one monospace for console/labels/data (e.g. **Geist Mono** or **JetBrains Mono**). Fluid type scale via `clamp()`.
- Texture: fine film grain (postprocessing), 1px hairline rules, scanline accents used sparingly (not retro-CRT).

**Why this can compete.** One strong, ownable concept executed across every surface (Awwwards' #1 criterion); WebGL with *purpose* — each scene visualizes something true about the work (cluster = the actual K8s/Rancher job, latent field = the actual Pinecone/RAG job); flawless motion via a single choreography system (GSAP+Lenis); and a power-user terminal that judges can actually play with. Reference bar: Lando Norris (OFF+BRAND) for scroll-synced 3D staging, Bruno Simon for playfulness with restraint applied, recent dev-portfolio SOTDs for the terminal-as-navigation pattern done *better* (ours drives real state, not just printed text).

**Swappability (per brief §1).** All concept-bearing values live in two token files:

- `src/config/theme.ts` — palette, type scale, spacing, radii, grain/bloom intensities → also emitted as CSS variables.
- `src/config/console.ts` — naming lexicon (`"deployment"`, `"SYS://"`, boot lines, status verbs), scene parameter presets (node counts, particle counts, colors per scene), terminal prompt string.

Retuning the metaphor = editing these two files + `/content`. No component restructuring.

---

## B. Information Architecture / Site Map

```
/                       HOME      — boot sequence → cluster hero → system intro
/about                  ABOUT     — operator profile, skills map, values
/work                   WORK      — deployment registry (project index)
/work/[slug]            CASE      — deployment inspector (deep-dive per project)
/experience             LOG       — career event log (animated timeline)
/lab                    LAB       — sandbox: experiments, shader toys, easter-egg surface
/contact                UPLINK    — contact form + socials + resume
/api/contact            POST      — serverless contact endpoint
sitemap.xml, robots.txt, opengraph-image, 404 (themed "service not found")
```

**Initial project slugs** (from resume; case-study details marked `// TODO: replace` where not in resume):
`stack8s-marketplace` (Helm charts + GHCR + marketplace), `k8s-workload-platform` (5 workload types via Rancher, Next.js + FastAPI), `node-provisioning-pipeline` (15+ environments), `diy-gc-platform` (NestJS Clean Architecture, RBAC, multi-tenant), `rag-assistant` (Gemini + Pinecone, multi-modal), `realtime-messaging` (WebSocket, S3, sub-200ms), `aris-rails` (live train tracking, 10k coords/min).

**Global chrome:** persistent top nav (logo/status chip, links, terminal launcher), terminal overlay (⌘K / Ctrl+K / `~` / mobile button), footer ("end of stream" + uptime + socials), page-transition layer, smooth scroll.

**Navigation redundancy:** every terminal command has a clickable/tappable equivalent. Terminal is additive, never required.

---

## C. Technical Architecture

### C1. Stack & versions (latest stable at build time; pinned in lockfile)

| Layer | Choice |
|---|---|
| Framework | Next.js 15.x (App Router, RSC), TypeScript 5.x, React 19.x |
| 3D | three ^0.17x, @react-three/fiber ^9, @react-three/drei ^10, @react-three/postprocessing ^3, custom GLSL (vite-style raw imports via `glsl` template strings or `.glsl` + raw-loader) |
| Motion | gsap ^3.13 (free incl. ScrollTrigger/SplitText) + @gsap/react (`useGSAP`), lenis ^1.x (`lenis/react`), motion ^12 (component micro-transitions only) |
| Styling | Tailwind CSS v4 + CSS variables from `theme.ts` |
| State | zustand ^5 (terminalStore, sceneStore, uiStore) |
| Content | typed TS modules in `/content` (+ MDX optional later for case studies) |
| Backend | Next.js Route Handler `/api/contact` on Vercel (Node runtime, zod validation, Resend/SMTP via env vars, honeypot + rate limit). Python function not needed — noted as brief-permitted option; TS handler avoids a second runtime for one endpoint. |
| Quality | ESLint, Prettier, `@axe-core/react` in dev, Lighthouse CI script |

### C2. Folder structure

```
src/
  app/
    layout.tsx                 # fonts, providers, chrome, metadata
    template.tsx               # page-transition boundary
    page.tsx                   # home
    about/page.tsx
    work/page.tsx
    work/[slug]/page.tsx       # generateStaticParams from content
    experience/page.tsx
    lab/page.tsx
    contact/page.tsx
    api/contact/route.ts
    sitemap.ts  robots.ts  opengraph-image.tsx  not-found.tsx
  components/
    chrome/        # Nav, Footer, StatusChip, PageTransition, Cursor, Preloader
    terminal/      # Terminal, BootSequence, Prompt, OutputLine, Suggestions
    sections/      # per-page DOM sections (Hero, SkillsMap, TimelineItem, ...)
    ui/            # primitives: Button, Link, Tag, Reveal, Marquee
  scenes/
    CanvasRoot.tsx             # single persistent <Canvas>, DPR cap, visibility pause
    SceneRouter.tsx            # mounts scene by sceneStore.active, Suspense + dispose
    cluster/                   # home: node graph (scene, shaders/, hooks)
    latent/                    # latent-space particle field
    pipeline/                  # data-stream transition/work-index scene
    deployment/                # per-project motif variants (keyed)
    shared/                    # grain, bloom config, useScrollCamera, fallbacks
  lib/
    commandBus.ts              # typed event bus (terminal ⇄ scenes ⇄ router)
    commands/                  # registry: nav.ts, fs.ts, eggs.ts, system.ts
    fakeFs.ts                  # POSIX-ish tree + resolver (ls/cd/cat)
    motion.ts                  # shared GSAP defaults, reveal helpers
    a11y.ts                    # reduced-motion + WebGL capability detection
  stores/        # terminalStore, sceneStore, uiStore (zustand)
  config/        # theme.ts, console.ts (creative tokens — see §A)
  content/       # profile.ts, skills.ts, experience.ts, projects.ts,
                 # terminal.ts (commands+fs+eggs), types.ts
public/          # fonts, og image, resume.pdf, draco/, models (if any)
```

### C3. Data flow & the command bus

```
content/*.ts ──(typed)──► pages/sections (RSC where possible)
                       └► terminal registry & fake fs

user input (keys/clicks/touch)
   └► terminalStore ─parse─► command registry
            └► commandBus.emit({type})
                  ├► next/navigation router  (goto, open, contact, resume)
                  ├► sceneStore              (theme, scene params, disturb)
                  └► terminal output         (help, whoami, ls, cat, eggs)

ScrollTrigger timelines ─► sceneStore.progress ─► useFrame lerps camera/uniforms
```

One **persistent `<Canvas>`** lives in `layout.tsx` behind the DOM (`position: fixed; z-index: 0`). `SceneRouter` cross-fades scenes on route change, so 3D survives page transitions (brief §5) while each route gets a *distinct* scene. Scenes lazy-load via `next/dynamic` + Suspense; unmounted scenes dispose geometries/materials/FBOs.

### C4. The 3-in-1 terminal

Single `<Terminal>` component, three modes via `terminalStore.mode`:

1. **`boot`** — fullscreen on first visit per session (`sessionStorage`), typed init sequence (~4s), skippable via any key / "skip" button / automatically under `prefers-reduced-motion`. Ends by handing camera to the cluster scene (shared timeline).
2. **`palette`** — overlay opened by ⌘K / Ctrl+K / `~` (when not in an input) or the nav button (mobile launcher: fixed bottom-right). Focus-trapped dialog (`role="dialog"`, `aria-modal`), ESC closes, focus restored on close.
3. **`inline`** — embedded full terminal on `/lab` for easter-egg exploration.

**Commands (v1):** `help`, `whoami`, `goto <page>`, `open <project>`, `ls`, `cd`, `cat`, `pwd`, `contact`, `resume`, `theme <name>`, `clear`, `history`. **Eggs:** `sudo` (denied, escalating humor), `matrix`, `hire`, `sl` (ASCII train — nod to ARIS Rails), `top` (fake career-process list), `ping anthropic.com`, `exit` (refuses politely), hidden `cat ~/.secrets`.
**UX:** ↑/↓ history, Tab completion, ghost-text autosuggest, command output virtualized after 200 lines. **Simulated shell only — no code execution; input is matched against the registry, never evaluated.**

### C5. WebGL scenes (4 distinct + fallbacks)

| Scene | Route | Build | Interactivity |
|---|---|---|---|
| **Cluster** | Home | Instanced icosphere nodes + GPU line connections, force-layout computed once, custom vertex displacement + fresnel-glow fragment shader | Raycast hover (node pulses + label), cursor parallax, **drag to disturb** (spring-back physics), scroll-driven camera path; terminal `theme`/boot reshapes it |
| **Latent field** | About (skills map) + `rag-assistant` case | ~60–120k instanced points, curl-noise drift in vertex shader, additive blending, violet-scoped palette | Scroll scrubs a "query vector" that attracts nearby points into skill clusters; pointer repels points |
| **Pipeline** | Work index + route transitions | Tube/ribbon geometry with scrolling dash shader + packet sprites | Scroll = flow speed; hovering a project card routes a highlighted packet to it |
| **Deployment motifs** | `/work/[slug]` | One parametric scene with per-project presets via `motifKey` (orbiting pods / chart helix / socket pulses / rail spline) | Orbit (damped), hover states; cheap enough for mobile |

Shared: `@react-three/postprocessing` (Bloom + Noise/grain + subtle Vignette; DOF on cluster only, desktop only). **Fallbacks:** capability check at boot → no WebGL / `prefers-reduced-motion` / save-data / low-end ⇒ static SVG/CSS render of each scene's silhouette; site fully functional DOM-only.

---

## D. Scroll & Reveal Storyboard (per page)

Conventions: Lenis smooth scroll everywhere; pinned sections use ScrollTrigger `pin` + `scrub` synced to `sceneStore.progress`; every reveal has a reduced-motion variant (fade-only or none); enter/exit choreography is symmetric (sections "power down" as you leave them).

**HOME** — 5 beats
1. *Boot* (no scroll): terminal types init lines → final line `mounting /home/hasnat …` → terminal glyphs dissolve into cluster nodes (shared GSAP timeline), nav fades in.
2. *Hero* (pinned, 100vh): cluster idles; name + role set in display type with mono status chip (`status: open_to_work`, `loc: Islamabad, PK`). Scroll begins camera push-in.
3. *System intro* (pinned, ~200vh scrub): camera glides through the cluster; three big mono statements reveal word-by-word (SplitText) — full-stack ownership / cloud-native infra / AI products — each highlighting a node group (cyan→violet→amber).
4. *Telemetry strip*: horizontal stat counters (2+ yrs, 15+ environments, 10+ Helm charts, sub-200ms) count up on enter; hairline rules draw in.
5. *Exit ramp*: cluster recedes to background; three oversized "subsystem" cards (WORK / LOG / UPLINK) slide up with parallax; footer "end of stream ▮".

**ABOUT** — 4 beats
1. Hero: `SYS://OPERATOR` label decodes (scramble-text), portrait/avatar block clipped-reveal; latent field boots dim in background.
2. *Story* (~150vh): long-bio paragraphs reveal line-by-line; margin annotations (mono) fade in like log comments.
3. *Skills map* (pinned, ~250vh — the page's big set piece): latent field organizes into 5 labeled clusters (Languages / Frontend / Backend / Cloud+Infra / AI+Data) as you scrub; DOM list syncs — hovering or focusing a skill (keyboard included) excites its particles. DOM-only fallback: animated tag grid.
4. *Values*: three principle cards scale-reveal; field disperses on exit.

**WORK (index)** — 3 beats
1. Hero: `SYS://REGISTRY` + count chip (`7 deployments · all healthy`); pipeline scene flows behind.
2. *Registry list* (the core): full-width rows, one per project — status dot, slug in mono, title in display, stack tags. On enter each row "deploys": progress bar wipes, status flips `pending → running`. Hover/touch: row expands preview, packet routes to it in the scene. Staggered, not pinned — index stays fast to scan.
3. Exit: pipeline converges to a single stream → CTA "inspect a deployment".

**WORK/[slug] (case study)** — 6 beats
1. *Inspector header* (pinned, 100vh): motif scene boots; metadata grid types in (`service`, `role`, `stack`, `status`, `links`).
2. *Problem*: oversized statement reveal.
3. *Architecture* (pinned, ~150vh): diagram strokes draw via SVG `stroke-dashoffset` scrub, synced annotations.
4. *Build log*: role + decisions as timestamped log entries sliding in.
5. *Outcome*: metric counters + before/after bars; clearly `// TODO`-labeled where not resume-sourced.
6. *Next deployment*: footer hand-off card with motif crossfade into the next project (no hard reload).

**EXPERIENCE** — 3 beats
1. Hero: `SYS://EVENTLOG` + total-uptime counter.
2. *Timeline* (pinned, ~300vh — the page's set piece): a vertical "commit stream" line draws as you scrub; six role entries (Eprecisio/Stack8s → Intellogeek) dock in alternating from left/right; each entry's highlights expand as its window is "active"; dates render as mono timestamps; small pipeline-scene pulses travel down the line between entries.
3. *Now*: current-state card (`HEAD → eprecisio/stack8s`) pinned briefly, then release to footer.

**LAB** — 3 beats
1. Hero: `SYS://SANDBOX — unstable channel` (amber accents, glitch-once title).
2. *Experiment grid*: cards (shader sketches, 3D toys, terminal) flip-reveal with stagger; each card is a live mini-canvas mounted only while in view (IntersectionObserver) — at most 2 active simultaneously.
3. *Inline terminal*: full terminal embedded with `hint: try "ls /secrets"`; egg discoveries persist as "unlocked" badges (in-memory + sessionStorage).

**CONTACT** — 2 beats
1. Hero: `SYS://UPLINK` + signal-pulse animation; availability chip.
2. *Form*: fields reveal as `stdin` prompts (name → email → message), labeled and accessible (real `<form>`, visible labels, error text via `aria-describedby`); submit = "transmit" with packet animation into the scene; success renders `200 OK — response ETA: <48h`; socials + `resume.pdf` as mono link list.

**Transitions (global):** old page sections power down (opacity/blur, 250ms) → pipeline streak wipes across → new scene cross-fades in canvas → new page boots (350ms). Total ≤ 700ms, interrupt-safe, reduced-motion ⇒ simple crossfade.

---

## E. Performance & Accessibility Budget

**Performance (hard targets)**
- Lighthouse desktop ≥ 90 performance (≥ 95 a11y/BP/SEO); mobile usable, ≥ 75.
- LCP < 2.5s (hero text is DOM, never canvas — LCP is type, not WebGL), CLS ≈ 0 (all media sized, fonts `size-adjust` fallbacks), INP < 200ms.
- Initial JS (route shell, gzip) < 200KB; three.js + scenes in lazy chunks loaded after first paint / on idle; per-scene chunk < 350KB; total transfer for home < 1.5MB (excl. lazy).
- Fonts: 2 variable families, subset woff2, `display: swap`, total < 200KB.
- WebGL: DPR capped at `min(devicePixelRatio, 2)` desktop / 1.5 mobile; instancing for all particles/nodes; single Canvas (one GL context); `frameloop` demand/paused when tab hidden or canvas offscreen; geometry/material/FBO disposal on scene swap; draw calls < 100/scene; adaptive degradation (drei `PerformanceMonitor` → lower particle counts, drop DOF first, then bloom).
- 60fps target mid-range laptop; 30fps floor mobile (simplified scenes); zero console errors/warnings.

**Accessibility**
- Everything keyboard-operable: nav, cards, skill map (focusable list mirrors the 3D), terminal (it's an input — history/completion/ESC all keyboard; focus-trapped dialog with restore).
- `prefers-reduced-motion`: boot skipped, pins become static sections, scrub animations replaced by opacity fades, scenes render a static frame or DOM fallback, Lenis disabled (native scroll).
- Visible focus rings (cyan, 2px offset) on dark; contrast ≥ 4.5:1 body, ≥ 3:1 large display text (palette pre-checked).
- Semantic HTML: real headings hierarchy per page, landmarks, `<form>` with labels; canvas `aria-hidden` with offscreen text equivalents for meaning-bearing scenes (e.g. skills list).
- Touch: all hover affordances have tap equivalents; terminal launcher button on mobile; hit targets ≥ 44px.
- Tested with axe (dev overlay) + manual keyboard pass + VoiceOver/NVDA smoke test per milestone.

**SEO/meta:** Metadata API per route, OG/Twitter cards, generated `opengraph-image`, sitemap/robots, favicon set, JSON-LD `Person` on home.

---

## F. Build Order / Milestones

App runnable at every milestone (`npm run dev` + deployable to Vercel).

| # | Milestone | Scope | Exit criteria |
|---|---|---|---|
| **M0** | Foundation | Next 15 + TS + Tailwind v4 scaffold; `config/theme.ts` + `console.ts` tokens → CSS vars; full typed `/content` layer wired with real resume data; fonts; ESLint/Prettier; GitHub repo + Vercel project; README skeleton | All routes exist as styled static pages reading from `/content`; deployed |
| **M1** | Motion & nav core | Lenis provider; GSAP/`useGSAP` setup + `lib/motion` reveal primitives; page-transition system (`template.tsx`); nav/footer/preloader; reduced-motion plumbing | Smooth scroll + choreographed route transitions, a11y pass on chrome |
| **M2** | Terminal & command bus | Terminal component (3 modes), command registry, fake fs, history/tab/suggest, ⌘K/`~`/mobile launcher, command bus wired to router; boot sequence (DOM version) | All v1 commands work; boot plays once/session, skippable; fully keyboard-operable |
| **M3** | Canvas core + Cluster scene | Persistent CanvasRoot, SceneRouter, capability detection + fallback layer, postprocessing pipeline; cluster scene with hover/drag/parallax; home storyboard (beats 1–5) incl. boot→scene handoff | Home complete at quality bar; 60fps desktop; fallback verified |
| **M4** | Work surface | Pipeline scene; work index storyboard; deployment-motif scene + presets; case-study template + all 7 project pages; `open <project>` integration | Full work section navigable terminal + click; per-page perf within budget |
| **M5** | About + Experience | Latent-field scene + skills set piece (with DOM fallback); about storyboard; experience timeline storyboard | Both pages complete; skill map keyboard-accessible |
| **M6** | Lab + Contact + backend | Lab grid + inline terminal + easter eggs; contact page + `/api/contact` (zod, honeypot, rate-limit, email via env); `contact`/`resume` commands finalized | Form delivers (or logs in dev); eggs discoverable; no blocking failures |
| **M7** | Polish & ship | Perf pass vs §E budgets (Lighthouse CI), full a11y audit, SEO/meta/OG/sitemap, custom cursor (optional w/ fallback), 404, cross-browser/device QA, README (run/deploy/content-swap guide), final Vercel deploy | All §7 non-negotiables green; zero console errors |

Estimated weight: M0–M2 ≈ 30%, M3 ≈ 20%, M4 ≈ 20%, M5 ≈ 15%, M6–M7 ≈ 15%.

---

## Open questions (answer with approval; defaults are safe)

1. **Contact delivery** — default: Resend with `RESEND_API_KEY` env var (logs to console in dev). OK?
2. **Fonts** — default: Geist + Geist Mono (free, variable, Vercel-native). Alternative: Space Grotesk + JetBrains Mono.
3. **Resume PDF** — provide a file for `/resume`, or stub `public/resume.pdf` for now?
4. **`theme <name>` command** — default: ships with `ops` (deep-space) + one alt (`phosphor`) since tokens make it nearly free. OK?

**Approve, or request changes — Phase 1 starts only on your go.**
