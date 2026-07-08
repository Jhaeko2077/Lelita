# Mapa de animaciones — Lelita

**Actualizado:** 2026-07-08 (implementación completa tras la revisión de motion; base del rediseño "El archivo de nuestra historia")

## Dónde se trabaja

| Pieza | Archivo | Qué contiene |
|---|---|---|
| Variants de Framer Motion | `lib/motion.ts` | TODAS las variants + `EASE_OUT` (cubic-bezier 0.23,1,0.32,1). Cualquier ajuste de motion se hace aquí. |
| Anclas en el JSX | `app/page.tsx` | Elementos animables con `data-animate="<nombre>"`. |
| Animaciones CSS (loops ambientales) | `app/globals.css` | Keyframes `floaty`, `rise`, `beat`, `twinkle` + comentarios `ANIMATION HOOK`. |

## Reglas vigentes (no romper)

- `EASE_OUT` fuerte en toda entrada; nunca `ease-in` en UI.
- Interacciones < 300ms; solo entradas de página/scroll llegan a ~500ms.
- Nunca entrar desde `scale(0)` (mínimo 0.94–0.96 + opacity).
- Springs solo en interacciones interrumpibles (`polaroidSpring`).
- **Reduced motion**: `MotionConfig reducedMotion="user"` envuelve ambas vistas (quita movimiento, conserva opacidad); los loops CSS se apagan en `globals.css`; el count-up se salta con `useReducedMotion()`.
- **Hover gating**: `future.hoverOnlyWhenSupported` en `tailwind.config.ts` — todo `hover:` queda tras `@media (hover:hover)`.
- Stagger 30–80ms, decorativo, nunca bloquea interacción.
- Solo `transform`/`opacity` (excepción puntual: blur ≤6px en el crossfade del lightbox, para fundir estados).
- Configs deterministas para SSR (nunca `Math.random()` en render).

## Inventario de anclas (`data-animate`) — estado IMPLEMENTADO

| Ancla | Animación implementada | Variants |
|---|---|---|
| `hero` | Secuencia orquestada de carga: cascada de 90ms entre hijos | `heroStagger` |
| `hero-title` | Entra en la cascada (y:14 → 0, 450ms) | `riseChild` |
| `hero-counter` | **Count-up 0→días en 900ms** (una vez por visita, skip con reduced-motion) + latido CSS `beat` | efecto en `page.tsx` + `riseChild` |
| (hairline del hero) | Se dibuja desde el centro (scaleX 0→1, 500ms) | `ruleDraw` |
| `phrase` | Palabras aparecen como tinta (solo opacidad, 40ms de stagger) | `wordStagger` + `wordIn` |
| `photo-stack` | Loop CSS `floaty` + entrada `scaleIn` como hijo del hero | `scaleIn` |
| `section-header` | Entra con su sección (whileInView, once) | `fadeRise` |
| `upload-form` | Fila "Archivo seleccionado" entra/sale (180ms) | `rowFade` + AnimatePresence |
| `polaroid` | Cascada de entrada 60ms (cap 180ms, `i % 4`); hover spring interrumpible sin delay; whileTap 0.99 | delay en `animate.transition`, `polaroidSpring` |
| `letter-card` | Entrada por scroll individual (whileInView, once, -30px) | `fadeRise` |
| (sello de lacre) | **Se estampa**: scale 1.35→1 + opacity, 260ms, rotación 8° vive en framer (no en CSS) | `sealStamp` |
| `chat-bubble` | **Solo mensajes nuevos** (createdAt > mount) entran desde su lado (±10px, 200ms); los históricos con `initial={false}` | `bubbleIn` (custom=own) |
| `lightbox` | Overlay 200ms + card 260ms; **crossfade con blur 6px al navegar** (exit 100ms < enter 180ms: el sistema responde rápido) | `overlayFade`, `lightboxCard`, `mediaSwap` |
| `toast` | 220ms, interrumpible (framer retarget-ea) | `toastPop` |
| `footer` | Hairline se dibuja al llegar al final (whileInView, once) | `ruleDraw` |
| `login-cover` / `login-form` | `scaleIn` / `fadeRise` on mount | — |
| `reset-panel` | Despliegue 240/300ms | `collapse` |
| `ambient-hearts` | Loop CSS `rise`; **cada 13 del mes se suman 6 corazones festivos** (`festiveHeartConfigs`, estado en efecto para evitar mismatch SSR) | CSS + prop `festive` |

## Ideas descartadas (y por qué — no reintentar sin razón nueva)

- **layoutId foto→lightbox**: las polaroids viven en columnas CSS y rotadas ±1.4°; la animación de layout desde un padre rotado glitchea. Se prefirió scale/fade + crossfade interno.
- **Animar todas las burbujas del chat al cargar**: todo-a-la-vez en un elemento visto a diario; solo animan los nuevos.
- **Count-up en cada refresh de 30s**: solo la primera vez por visita (ref `daysCountedUp`).

## Pendientes posibles (siguiente sesión)

- Reacciones con corazón (doble tap → heart burst en polaroids): requiere action nueva en `route.ts` — es feature, no solo motion.
- Estrella fugaz ocasional en modo noche (`.stars`).
- `@starting-style` para los toasts si algún día se quitan de framer.
