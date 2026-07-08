import type { Variants } from 'framer-motion';

/*
 * ============================================================
 *  SISTEMA DE ANIMACIONES — todas las variants viven aquí
 * ============================================================
 * app/page.tsx solo referencia estas variants; los anclajes del JSX llevan
 * data-animate="<nombre>" y el mapa completo está en docs/ANIMATION-HOOKS.md.
 *
 * Criterios (animations.dev / revisión 2026-07-08):
 * - ease-out fuerte en entradas (EASE_OUT), nunca ease-in en UI.
 * - Interacciones < 300ms; solo las entradas de página/scroll llegan a ~500ms.
 * - Nunca entrar desde scale(0); mínimo 0.94–0.96 + opacity.
 * - Springs solo en interacciones interrumpibles (hover de polaroids).
 * - prefers-reduced-motion: MotionConfig reducedMotion="user" en page.tsx
 *   (quita movimiento, conserva opacidad) + bloque CSS para los loops.
 * - Stagger 30–80ms entre ítems, nunca bloquea interacción.
 */

/** cubic-bezier(0.23, 1, 0.32, 1) — ease-out fuerte para UI */
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** Entrada estándar de secciones y cards (usada con whileInView). */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }
};

/** Entrada del bloque de fotos / portada del login. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } }
};

/** Despliegue vertical de formularios ocultos (frase, reset de contraseña). */
export const collapse: Variants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.24, ease: EASE_OUT } },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: EASE_OUT } }
};

/** Toasts — cortos e interrumpibles (framer retarget-ea desde el estado actual). */
export const toastPop: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } }
};

/** Fondo del lightbox. */
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } }
};

/** Contenido del lightbox (modal centrado: origen center es correcto). */
export const lightboxCard: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.26, ease: EASE_OUT } }
};

/**
 * Crossfade al navegar dentro del lightbox (flechas). Blur sutil para fundir
 * los dos estados en una sola transformación percibida (< 20px, barato).
 * Salida más rápida que la entrada: el sistema responde, no delibera.
 */
export const mediaSwap: Variants = {
  hidden: { opacity: 0, filter: 'blur(6px)', transition: { duration: 0.1, ease: EASE_OUT } },
  visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.18, ease: EASE_OUT } }
};

/** Spring compartido de las polaroids (hover interrumpible — mantiene velocidad). */
export const polaroidSpring = { type: 'spring', stiffness: 220, damping: 20 } as const;

/* ---------- Secuencia orquestada del hero (una vez por visita) ---------- */

/** Contenedor del hero: hijos en cascada de 90ms. Decorativo — no bloquea input. */
export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } }
};

/** Hijo del hero con movimiento (título, contador, frase). */
export const riseChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }
};

/** Hijo del hero sin movimiento (fila de controles — utilidades, solo opacidad). */
export const fadeChild: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } }
};

/** El hairline se dibuja desde el centro (transform-origin: center en el style). */
export const ruleDraw: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: EASE_OUT } }
};

/** Contenedor de la frase manuscrita: palabras a 40ms. */
export const wordStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } }
};

/** Palabra individual — solo opacidad (los spans siguen inline, la tinta "aparece"). */
export const wordIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } }
};

/* ---------- Piezas puntuales ---------- */

/** El sello de lacre se estampa al revelarse la carta (rara vez visto: puede deleitar). */
export const sealStamp: Variants = {
  hidden: { opacity: 0, scale: 1.35, rotate: 8 },
  visible: { opacity: 1, scale: 1, rotate: 8, transition: { duration: 0.26, ease: EASE_OUT } }
};

/**
 * Burbuja de chat NUEVA (createdAt posterior al mount): entra desde su lado.
 * Los mensajes históricos no animan (initial={false}) — nunca todo-a-la-vez.
 */
export const bubbleIn: Variants = {
  hidden: (own: boolean) => ({ opacity: 0, y: 6, x: own ? 10 : -10 }),
  visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.2, ease: EASE_OUT } }
};

/** Aparición corta de filas auxiliares (nombre de archivo seleccionado). */
export const rowFade: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT } }
};

/** Cascada genérica para grupos (galería inicial usa delays por índice, cap 180ms). */
export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};
