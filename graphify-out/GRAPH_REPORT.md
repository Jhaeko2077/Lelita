# Graph Report - .  (2026-07-04)

## Corpus Check
- Corpus is ~27,265 words - fits in a single context window. You may not need a graph.

## Summary
- 144 nodes · 162 edges · 18 communities (12 shown, 6 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.89)
- Token cost: 108,478 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Sistema de Diseño y Aprendizajes|Sistema de Diseño y Aprendizajes]]
- [[_COMMUNITY_Configuración TypeScript|Configuración TypeScript]]
- [[_COMMUNITY_UI Principal y Tipos|UI Principal y Tipos]]
- [[_COMMUNITY_Paquete y DevDependencies|Paquete y DevDependencies]]
- [[_COMMUNITY_API Backend (route.ts)|API Backend (route.ts)]]
- [[_COMMUNITY_Persistencia MongoDB (store.ts)|Persistencia MongoDB (store.ts)]]
- [[_COMMUNITY_Dependencias de Runtime|Dependencias de Runtime]]
- [[_COMMUNITY_Layout y Tipografías|Layout y Tipografías]]
- [[_COMMUNITY_Foto 1 Beso en la Colina|Foto 1: Beso en la Colina]]
- [[_COMMUNITY_Foto 2 Abrazo Alzado|Foto 2: Abrazo Alzado]]
- [[_COMMUNITY_Configuración Next.js|Configuración Next.js]]
- [[_COMMUNITY_Configuración Tailwind|Configuración Tailwind]]
- [[_COMMUNITY_Pitfall background-attachment|Pitfall background-attachment]]
- [[_COMMUNITY_Idea Reacciones con Corazón|Idea: Reacciones con Corazón]]
- [[_COMMUNITY_Pendiente Hash de Contraseñas|Pendiente: Hash de Contraseñas]]
- [[_COMMUNITY_Toasts de Notificación|Toasts de Notificación]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Lelita's Photlibrary (App)` - 7 edges
3. `MongoDB Atlas State Persistence` - 6 edges
4. `getMongoCollection()` - 5 edges
5. `scripts` - 5 edges
6. `Photo/Video Feed with Infinite Scroll` - 5 edges
7. `Design System: Archivo de amor editorial` - 5 edges
8. `ensureMongoState()` - 4 edges
9. `ensureState()` - 4 edges
10. `MediaItem` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Masonry Polaroid Gallery` --semantically_similar_to--> `Photo/Video Feed with Infinite Scroll`  [INFERRED] [semantically similar]
  docs/REDESIGN-2026-07-04.md → README.md
- `Recommended MongoDB Media Data Model` --conceptually_related_to--> `MediaItem`  [INFERRED]
  README.md → lib/types.ts
- `Chat Redesign as Messaging Bubbles` --semantically_similar_to--> `Couple Chat (Text + Media)`  [INFERRED] [semantically similar]
  docs/REDESIGN-2026-07-04.md → README.md
- `Redesigned Lightbox (Keyboard Nav)` --semantically_similar_to--> `Lightbox with Prev/Next Navigation`  [INFERRED] [semantically similar]
  docs/REDESIGN-2026-07-04.md → README.md
- `Letters as Stationery (.stationery)` --semantically_similar_to--> `Secret Letters (Jeicob / Lelita)`  [INFERRED] [semantically similar]
  docs/REDESIGN-2026-07-04.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Editorial Love Archive Design System Foundation** — docs_redesign_2026_07_04_editorial_love_archive, docs_redesign_2026_07_04_paleta, docs_redesign_2026_07_04_tipografia, docs_redesign_2026_07_04_photostack, docs_redesign_2026_07_04_night_mode [EXTRACTED 1.00]
- **Media Upload and Persistence Pipeline (Cloudinary + MongoDB)** — readme_cloudinary_upload_flow, readme_mongodb_state_persistence, readme_media_data_model, api_app_route [EXTRACTED 1.00]
- **UI Components Implementing the Editorial Redesign** — docs_redesign_2026_07_04_masonry_gallery, docs_redesign_2026_07_04_chat_bubbles, docs_redesign_2026_07_04_stationery_letters, docs_redesign_2026_07_04_lightbox, docs_redesign_2026_07_04_toasts, docs_redesign_2026_07_04_floatinghearts [EXTRACTED 1.00]

## Communities (18 total, 6 thin omitted)

### Community 0 - "Sistema de Diseño y Aprendizajes"
Cohesion: 0.10
Nodes (26): Accessibility Measures, Animation Criteria (Emil Kowalski), Chat Redesign as Messaging Bubbles, Design System: Archivo de amor editorial, FloatingHearts Component, Redesigned Lightbox (Keyboard Nav), localStorage Session Trick for UI Verification, Masonry Polaroid Gallery (+18 more)

### Community 1 - "Configuración TypeScript"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "UI Principal y Tipos"
Cohesion: 0.13
Nodes (10): heartConfigs, initial, Pending Idea: Timeline 'Nuestra historia', AppState, ChatMessage, Letter, MediaItem, ResetCode (+2 more)

### Community 3 - "Paquete y DevDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+8 more)

### Community 4 - "API Backend (route.ts)"
Cohesion: 0.17
Nodes (12): CloudinaryResourceType, CloudinaryUploadResult, GET(), getTransporter(), MailTransporter, maybeSendResetEmail(), maybeSendResetWebhook(), POST() (+4 more)

### Community 5 - "Persistencia MongoDB (store.ts)"
Cohesion: 0.28
Nodes (12): assertMongoEnv(), deepCloneState(), defaultState, ensureMongoState(), ensureState(), getMongoClient(), getMongoCollection(), loadSeedState() (+4 more)

### Community 6 - "Dependencias de Runtime"
Cohesion: 0.25
Nodes (8): dependencies, cloudinary, framer-motion, mongodb, next, nodemailer, react, react-dom

### Community 7 - "Layout y Tipografías"
Cohesion: 0.33
Nodes (4): caveat, figtree, fraunces, metadata

### Community 8 - "Foto 1: Beso en la Colina"
Cohesion: 0.70
Nodes (5): Andean Town Below with Domed Church, Golden Dry-Grass Hillside with Eucalyptus Trees, Couple Kissing on Golden Hillside, Vintage Romantic Styling (Ivory Blouse, Taupe Trousers, Riding Boots), Warm Ivory-Gold Palette Under Deep Blue Sky

### Community 9 - "Foto 2: Abrazo Alzado"
Cohesion: 0.40
Nodes (5): Arid Andean Hillside Setting, Ivory and Warm Taupe Palette, Jeicob and Lelita (Couple), Lift Embrace Kiss Pose, Hillside Lift-and-Kiss Photo

## Knowledge Gaps
- **69 isolated node(s):** `SendMailOptions`, `MailTransporter`, `CloudinaryResourceType`, `CloudinaryUploadResult`, `fraunces` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Recommended MongoDB Media Data Model` connect `UI Principal y Tipos` to `Sistema de Diseño y Aprendizajes`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `MongoDB Atlas State Persistence` connect `Sistema de Diseño y Aprendizajes` to `UI Principal y Tipos`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Lelita's Photlibrary (App)` (e.g. with `Design System: Archivo de amor editorial` and `localStorage Session Trick for UI Verification`) actually correct?**
  _`Lelita's Photlibrary (App)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SendMailOptions`, `MailTransporter`, `CloudinaryResourceType` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Sistema de Diseño y Aprendizajes` be split into smaller, more focused modules?**
  _Cohesion score 0.09538461538461539 - nodes in this community are weakly interconnected._
- **Should `Configuración TypeScript` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `UI Principal y Tipos` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._