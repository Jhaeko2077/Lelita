# Graph Report - .  (2026-07-08)

## Corpus Check
- 22 files · ~29,819 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 190 nodes · 239 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.88)
- Token cost: 123,293 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Pagina principal y animaciones UI|Pagina principal y animaciones UI]]
- [[_COMMUNITY_Sistema de diseno editorial (rediseno 07-04)|Sistema de diseno editorial (rediseno 07-04)]]
- [[_COMMUNITY_API Cloudinary, email y acciones|API: Cloudinary, email y acciones]]
- [[_COMMUNITY_Layout, tipografia y mapa de animaciones|Layout, tipografia y mapa de animaciones]]
- [[_COMMUNITY_Configuracion TypeScript|Configuracion TypeScript]]
- [[_COMMUNITY_Dependencias del proyecto|Dependencias del proyecto]]
- [[_COMMUNITY_Persistencia MongoDB (store)|Persistencia MongoDB (store)]]
- [[_COMMUNITY_Tooling y devDependencies|Tooling y devDependencies]]
- [[_COMMUNITY_Foto 1 colina dorada (escena)|Foto 1: colina dorada (escena)]]
- [[_COMMUNITY_Foto 2 abrazo en la colina (escena)|Foto 2: abrazo en la colina (escena)]]
- [[_COMMUNITY_Foto 1 como asset de diseno|Foto 1 como asset de diseno]]
- [[_COMMUNITY_Foto 2 como asset de diseno|Foto 2 como asset de diseno]]
- [[_COMMUNITY_Configuracion Next.js|Configuracion Next.js]]
- [[_COMMUNITY_Leccion background-attachment|Leccion: background-attachment]]
- [[_COMMUNITY_Idea reacciones con corazon|Idea: reacciones con corazon]]
- [[_COMMUNITY_Pendiente hash de contrasenas|Pendiente: hash de contrasenas]]
- [[_COMMUNITY_Toasts|Toasts]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Lelita's Photlibrary (App)` - 7 edges
3. `MongoDB Atlas State Persistence` - 6 edges
4. `Mapa de animaciones — Lelita (ANIMATION-HOOKS.md)` - 6 edges
5. `Rediseño 'El archivo de nuestra historia' — Sesión 2026-07-08` - 6 edges
6. `getMongoCollection()` - 5 edges
7. `scripts` - 5 edges
8. `Photo/Video Feed with Infinite Scroll` - 5 edges
9. `Design System: Archivo de amor editorial` - 5 edges
10. `Concepto 'El archivo de nuestra historia' (archivo editorial)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Rediseño 'El archivo de nuestra historia' — Sesión 2026-07-08` --references--> `cld()`  [EXTRACTED]
  docs/REDESIGN-2026-07-08.md → app/page.tsx
- `sealStamp` --conceptually_related_to--> `Sello de lacre 'J♥L' (.seal)`  [EXTRACTED]
  lib/motion.ts → docs/REDESIGN-2026-07-08.md
- `Recommended MongoDB Media Data Model` --conceptually_related_to--> `MediaItem`  [INFERRED]
  C:/Jeicob/TaskMove/Proyectos/lelita/README.md → lib/types.ts
- `Crossfade del lightbox (scale/fade + blur interno)` --conceptually_related_to--> `overlayFade`  [EXTRACTED]
  docs/ANIMATION-HOOKS.md → lib/motion.ts
- `Crossfade del lightbox (scale/fade + blur interno)` --conceptually_related_to--> `lightboxCard`  [EXTRACTED]
  docs/ANIMATION-HOOKS.md → lib/motion.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Media Upload and Persistence Pipeline (Cloudinary + MongoDB)** — readme_cloudinary_upload_flow, readme_mongodb_state_persistence, readme_media_data_model, api_app_route [EXTRACTED 1.00]
- **Editorial Love Archive Design System Foundation** — docs_redesign_2026_07_04_editorial_love_archive, docs_redesign_2026_07_04_paleta, docs_redesign_2026_07_04_tipografia, docs_redesign_2026_07_04_photostack, docs_redesign_2026_07_04_night_mode [EXTRACTED 1.00]
- **UI Components Implementing the Editorial Redesign** — docs_redesign_2026_07_04_masonry_gallery, docs_redesign_2026_07_04_chat_bubbles, docs_redesign_2026_07_04_stationery_letters, docs_redesign_2026_07_04_lightbox, docs_redesign_2026_07_04_toasts, docs_redesign_2026_07_04_floatinghearts [EXTRACTED 1.00]
- **Sistema de animación de Lelita: variants + anclas JSX + loops CSS** — lib_motion, app_page, app_globals [EXTRACTED 1.00]
- **Cobertura completa de reduced motion (MotionConfig + CSS + count-up skip)** — docs_animation_hooks_reduced_motion, docs_animation_hooks_count_up, docs_animation_hooks_css_loops [EXTRACTED 1.00]
- **Flujo de motion del lightbox: overlay + card + crossfade de media** — lib_motion_overlayfade, lib_motion_lightboxcard, lib_motion_mediaswap, docs_animation_hooks_lightbox_crossfade [EXTRACTED 1.00]

## Communities (19 total, 5 thin omitted)

### Community 0 - "Pagina principal y animaciones UI"
Cohesion: 0.10
Nodes (26): cld(), festiveHeartConfigs, heartConfigs, Home(), initial, Política de animación del chat: solo mensajes nuevos, Crossfade del lightbox (scale/fade + blur interno), bubbleIn (+18 more)

### Community 1 - "Sistema de diseno editorial (rediseno 07-04)"
Cohesion: 0.09
Nodes (29): Accessibility Measures, Animation Criteria (Emil Kowalski), Chat Redesign as Messaging Bubbles, Design System: Archivo de amor editorial, FloatingHearts Component, Redesigned Lightbox (Keyboard Nav), localStorage Session Trick for UI Verification, Masonry Polaroid Gallery (+21 more)

### Community 2 - "API: Cloudinary, email y acciones"
Cohesion: 0.12
Nodes (17): CloudinaryResourceType, CloudinaryUploadResult, GET(), getTransporter(), MailTransporter, maybeSendResetEmail(), maybeSendResetWebhook(), POST() (+9 more)

### Community 3 - "Layout, tipografia y mapa de animaciones"
Cohesion: 0.12
Nodes (18): app/globals.css — keyframes CSS de loops ambientales, caveat, figtree, fraunces, metadata, viewport, Mapa de animaciones — Lelita (ANIMATION-HOOKS.md), Count-up del contador de días (0→días en 900ms) (+10 more)

### Community 4 - "Configuracion TypeScript"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "Dependencias del proyecto"
Cohesion: 0.12
Nodes (16): dependencies, cloudinary, framer-motion, mongodb, next, nodemailer, react, react-dom (+8 more)

### Community 6 - "Persistencia MongoDB (store)"
Cohesion: 0.28
Nodes (12): assertMongoEnv(), deepCloneState(), defaultState, ensureMongoState(), ensureState(), getMongoClient(), getMongoCollection(), loadSeedState() (+4 more)

### Community 7 - "Tooling y devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript

### Community 8 - "Foto 1: colina dorada (escena)"
Cohesion: 0.70
Nodes (5): Andean Town Below with Domed Church, Golden Dry-Grass Hillside with Eucalyptus Trees, Couple Kissing on Golden Hillside, Vintage Romantic Styling (Ivory Blouse, Taupe Trousers, Riding Boots), Warm Ivory-Gold Palette Under Deep Blue Sky

### Community 9 - "Foto 2: abrazo en la colina (escena)"
Cohesion: 0.40
Nodes (5): Arid Andean Hillside Setting, Ivory and Warm Taupe Palette, Jeicob and Lelita (Couple), Lift Embrace Kiss Pose, Hillside Lift-and-Kiss Photo

### Community 10 - "Foto 1 como asset de diseno"
Cohesion: 0.50
Nodes (4): Foto de pareja besándose en colina (Jeicob & Lelita), Ambiente romántico con estética vintage, Asset de diseño de la web de pareja Lelita, Paisaje semiárido con cielo azul y pueblo al fondo

### Community 11 - "Foto 2 como asset de diseno"
Cohesion: 0.67
Nodes (4): Imagen2 — Foto de pareja (Jeicob cargando a Lelita), Asset de diseño de la web Lelita, Momento romántico — beso al aire libre, Paisaje andino soleado (cerros áridos y eucalipto)

## Knowledge Gaps
- **77 isolated node(s):** `SendMailOptions`, `MailTransporter`, `CloudinaryResourceType`, `CloudinaryUploadResult`, `fraunces` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MediaItem` connect `Sistema de diseno editorial (rediseno 07-04)` to `API: Cloudinary, email y acciones`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Lelita's Photlibrary (App)` (e.g. with `Design System: Archivo de amor editorial` and `localStorage Session Trick for UI Verification`) actually correct?**
  _`Lelita's Photlibrary (App)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SendMailOptions`, `MailTransporter`, `CloudinaryResourceType` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pagina principal y animaciones UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0962566844919786 - nodes in this community are weakly interconnected._
- **Should `Sistema de diseno editorial (rediseno 07-04)` be split into smaller, more focused modules?**
  _Cohesion score 0.08620689655172414 - nodes in this community are weakly interconnected._
- **Should `API: Cloudinary, email y acciones` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._
- **Should `Layout, tipografia y mapa de animaciones` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._