'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useReducedMotion } from 'framer-motion';
import { AppState, Letter } from '@/lib/types';
import {
  EASE_OUT,
  bubbleIn,
  collapse,
  fadeChild,
  fadeRise,
  heroStagger,
  lightboxCard,
  mediaSwap,
  overlayFade,
  polaroidSpring,
  riseChild,
  rowFade,
  ruleDraw,
  scaleIn,
  sealStamp,
  toastPop,
  wordIn,
  wordStagger
} from '@/lib/motion';

const initial: AppState = {
  users: {},
  resetCodes: {},
  phrase: 'Cada día contigo es una historia hermosa.',
  theme: 'day',
  media: [],
  letters: [],
  chat: []
};

const api = async (action: string, payload: unknown = {}) => {
  const res = await fetch('/api/app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Error');
  return data;
};

const fmtDate = (time: number) =>
  new Date(time).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

// Transformación de entrega de Cloudinary (solo presentación): sirve imágenes
// optimizadas y responsivas sin tocar la URL original guardada en la BD.
const cld = (url: string, width = 900) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
    : url;

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// Configs deterministas: evita hydration mismatch (nunca Math.random en render SSR)
const heartConfigs = [
  { left: '6%', d: '22s', delay: '-3s', s: 0.7, o: 0.35, sway: '40px' },
  { left: '16%', d: '26s', delay: '-14s', s: 1.1, o: 0.3, sway: '-30px' },
  { left: '28%', d: '19s', delay: '-8s', s: 0.5, o: 0.4, sway: '24px' },
  { left: '42%', d: '28s', delay: '-20s', s: 0.9, o: 0.25, sway: '-45px' },
  { left: '55%', d: '21s', delay: '-5s', s: 0.6, o: 0.35, sway: '36px' },
  { left: '68%', d: '25s', delay: '-17s', s: 1.2, o: 0.22, sway: '-26px' },
  { left: '80%', d: '18s', delay: '-11s', s: 0.55, o: 0.4, sway: '30px' },
  { left: '91%', d: '24s', delay: '-2s', s: 0.8, o: 0.3, sway: '-38px' }
];

// Corazones extra solo los 13 de cada mes (mesiversario) — también deterministas
const festiveHeartConfigs = [
  { left: '11%', d: '17s', delay: '-6s', s: 0.65, o: 0.4, sway: '28px' },
  { left: '35%', d: '20s', delay: '-12s', s: 0.85, o: 0.35, sway: '-34px' },
  { left: '48%', d: '16s', delay: '-4s', s: 0.5, o: 0.45, sway: '22px' },
  { left: '62%', d: '23s', delay: '-15s', s: 1.0, o: 0.3, sway: '30px' },
  { left: '74%', d: '18s', delay: '-9s', s: 0.6, o: 0.4, sway: '-26px' },
  { left: '96%', d: '21s', delay: '-1s', s: 0.75, o: 0.35, sway: '36px' }
];

const FloatingHearts = ({ festive = false }: { festive?: boolean }) => (
  <div className="hearts" data-animate="ambient-hearts" aria-hidden="true">
    {(festive ? [...heartConfigs, ...festiveHeartConfigs] : heartConfigs).map((h, i) => (
      <span
        key={i}
        className="heart-float"
        style={{
          left: h.left,
          ['--d' as string]: h.d,
          ['--delay' as string]: h.delay,
          ['--s' as string]: h.s,
          ['--o' as string]: h.o,
          ['--sway' as string]: h.sway
        }}
      >
        <HeartIcon className="h-6 w-6" />
      </span>
    ))}
  </div>
);

const PhotoStack = ({ size = 'md' }: { size?: 'md' | 'lg' }) => {
  const dims = size === 'lg' ? 'w-44 md:w-52' : 'w-28 md:w-36';
  return (
    <div className="relative flex items-center justify-center" data-animate="photo-stack" aria-hidden="true">
      <div className={`keepsake floaty ${dims} -rotate-6`} style={{ ['--tilt' as string]: '-6deg' }}>
        <img src="/img/imagen1.jpeg" alt="" className="aspect-[3/4] w-full rounded-[3px] object-cover" />
        <p className="pt-1.5 text-center font-hand text-sm text-ink/60 dark:text-rose-50/60">nosotros ♡</p>
      </div>
      <div className={`keepsake floaty-late ${dims} -ml-10 mt-10 rotate-6`} style={{ ['--tilt' as string]: '6deg' }}>
        <img src="/img/imagen2.jpeg" alt="" className="aspect-[3/4] w-full rounded-[3px] object-cover" />
        <p className="pt-1.5 text-center font-hand text-sm text-ink/60 dark:text-rose-50/60">13 · 03 · 25</p>
      </div>
    </div>
  );
};

// La página es su historia contada por capítulos: la numeración encabeza cada sección
const SectionHeader = ({ chapter, title, note }: { chapter: string; title: string; note?: string }) => (
  <div data-animate="section-header">
    <p className="chapter-num">Capítulo {chapter}</p>
    <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
      <h2 className="font-display text-2xl font-semibold text-ink dark:text-rose-50 md:text-3xl">{title}</h2>
      {note && <span className="font-hand text-xl text-wine/70 dark:text-rose-200/70">{note}</span>}
    </div>
  </div>
);

export default function Home() {
  const [state, setState] = useState<AppState>(initial);
  const [user, setUser] = useState('');
  const [auth, setAuth] = useState({ username: 'jeicob', email: '', password: '' });
  const [media, setMedia] = useState({ type: 'image/jpeg', description: '' });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [letter, setLetter] = useState({ title: '', text: '', to: 'lelita' as 'jeicob' | 'lelita' });
  const [chat, setChat] = useState({ text: '', mediaType: 'image/jpeg' });
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false);
  const [reset, setReset] = useState({ email: '', code: '', newPassword: '', debugCode: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState('');
  const [counterNow, setCounterNow] = useState(Date.now());
  const [isPublishingMedia, setIsPublishingMedia] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const reduceMotion = useReducedMotion();
  const [shownDays, setShownDays] = useState(0);
  const daysCountedUp = useRef(false);
  const chatMountedAt = useRef(Date.now());
  const [festiveHearts, setFestiveHearts] = useState(false);

  const filteredMedia = useMemo(
    () => state.media.filter((item) => item.description.toLowerCase().includes(mediaFilter.toLowerCase())),
    [state.media, mediaFilter]
  );

  const refresh = async () => {
    const res = await fetch('/api/app', { cache: 'no-store' });
    setState(await res.json());
  };

  const safeRun = async (fn: () => Promise<void>, successMessage?: string) => {
    try {
      setError('');
      await fn();
      if (successMessage) setNotice(successMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    }
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo local.'));
      reader.readAsDataURL(file);
    });

  const uploadLocalFile = async (file: File, context: 'media' | 'chat', mediaType: string) => {
    const fileDataUrl = await fileToDataUrl(file);
    const out = await api('uploadFile', { fileDataUrl, context, mediaType });
    return {
      url: String(out.url),
      type: String(out.type || mediaType),
      publicId: String(out.publicId || ''),
      resourceType: String(out.resourceType || (mediaType.startsWith('video') ? 'video' : 'image'))
    };
  };

  useEffect(() => {
    refresh();
    const savedUser = window.localStorage.getItem('lelita_session_user');
    if (savedUser) setUser(savedUser);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('night', state.theme === 'night');
  }, [state.theme]);

  useEffect(() => {
    const filteredLength = state.media.filter((item) => item.description.toLowerCase().includes(mediaFilter.toLowerCase())).length;

    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setVisibleCount((v) => Math.min(v + 4, filteredLength));
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [state.media, mediaFilter]);

  useEffect(() => {
    const timer = setInterval(() => setCounterNow(Date.now()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  const counters = useMemo(() => {
    const start = new Date('2025-03-13T00:00:00');
    const now = new Date(counterNow);
    const ms = now.getTime() - start.getTime();
    const days = Math.floor(ms / 86_400_000);

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let day = now.getDate() - start.getDate();

    if (day < 0) {
      months -= 1;
      const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      day += prevMonthDays;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { days, years, months, day };
  }, [counterNow]);

  // Count-up del contador de días: una sola vez por visita (momento firma del hero).
  // Con prefers-reduced-motion va directo al valor; los refrescos de 30 s también.
  useEffect(() => {
    if (daysCountedUp.current || reduceMotion) {
      daysCountedUp.current = true;
      setShownDays(counters.days);
      return;
    }
    daysCountedUp.current = true;
    const controls = animate(0, counters.days, {
      duration: 0.9,
      ease: EASE_OUT,
      onUpdate: (v) => setShownDays(Math.round(v))
    });
    return () => controls.stop();
  }, [counters.days, reduceMotion]);

  // Mesiversario: cada 13 del mes llueven más corazones (en efecto: evita mismatch SSR)
  useEffect(() => {
    setFestiveHearts(new Date().getDate() === 13);
  }, []);

  const qrUrl = useMemo(() => {
    const target = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';
    return `https://quickchart.io/qr?size=170&text=${encodeURIComponent(target)}`;
  }, []);

  const visibleMedia = filteredMedia.slice(0, visibleCount);

  const lightboxIndex = useMemo(() => filteredMedia.findIndex((m) => m.id === lightboxId), [filteredMedia, lightboxId]);
  const lightbox = lightboxIndex >= 0 ? filteredMedia[lightboxIndex] : null;

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxId(null);
      if (e.key === 'ArrowLeft') setLightboxId(filteredMedia[(lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length]?.id || null);
      if (e.key === 'ArrowRight') setLightboxId(filteredMedia[(lightboxIndex + 1) % filteredMedia.length]?.id || null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, lightboxIndex, filteredMedia]);

  const doAuth = async (e: FormEvent) => {
    e.preventDefault();
    await safeRun(async () => {
      const out = await api('auth', auth);
      setUser(out.user);
      window.localStorage.setItem('lelita_session_user', out.user);
      await refresh();
    }, 'Sesión iniciada 💖');
  };

  const editLetter = (targetLetter: Letter) => {
    const title = prompt('Editar título', targetLetter.title);
    const text = prompt('Editar texto', targetLetter.text);
    if (!title || !text) return;

    safeRun(async () => {
      await api('editLetter', { id: targetLetter.id, user, title, text });
      await refresh();
    }, 'Carta actualizada ✍️');
  };

  if (!user) {
    return (
      <MotionConfig reducedMotion="user">
      <main className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center overflow-hidden px-6 py-10">
        <FloatingHearts festive={festiveHearts} />

        <div className="relative z-10 grid w-full items-center gap-12 md:grid-cols-2">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden text-center md:block"
            data-animate="login-cover"
          >
            <p className="eyebrow mb-3">El archivo de nuestra historia</p>
            <h1 className="font-display text-5xl font-semibold italic leading-tight text-wine dark:text-rose-100 lg:text-6xl">
              Jeicob <span className="not-italic text-rose">&amp;</span> Lelita
            </h1>
            <div className="rule-heart mx-auto my-7 max-w-sm" aria-hidden="true">
              <HeartIcon className="h-4 w-4" />
            </div>
            <PhotoStack size="lg" />
            <p className="mt-10 font-hand text-2xl text-wine/80 dark:text-rose-200/80">nuestra historia favorita ♡</p>
          </motion.div>

          <motion.form
            variants={fadeRise}
            initial="hidden"
            animate="visible"
            onSubmit={doAuth}
            className="card mx-auto w-full max-w-md space-y-4 p-7"
            data-animate="login-form"
          >
            <div className="space-y-1">
              <p className="eyebrow">Desde el 13 de marzo de 2025</p>
              <h1 className="font-display text-4xl font-semibold italic text-wine dark:text-rose-200">
                Jeicob <span className="not-italic text-rose">&amp;</span> Lelita
              </h1>
              <p className="text-sm text-ink/60 dark:text-rose-50/60">
                Nuestro pequeño rincón del mundo: recuerdos, cartas y mensajes solo para dos.
              </p>
            </div>

            <select value={auth.username} onChange={(e) => setAuth({ ...auth, username: e.target.value })} className="input">
              <option value="jeicob">jeicob</option>
              <option value="lelita">lelita</option>
            </select>
            <input placeholder="Email" type="email" className="input" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
            <input placeholder="Contraseña" type="password" className="input" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
            <button className="btn-primary w-full">
              <HeartIcon className="h-4 w-4" /> Entrar / Registrarme
            </button>

            <button type="button" onClick={() => setResetOpen((v) => !v)} className="btn-ghost w-full">
              Recuperar contraseña
            </button>
            <AnimatePresence>
              {resetOpen && (
                <motion.div variants={collapse} initial="hidden" animate="visible" exit="hidden" className="space-y-2 overflow-hidden" data-animate="reset-panel">
                  <input placeholder="Email" className="input" value={reset.email} onChange={(e) => setReset({ ...reset, email: e.target.value })} />
                  <div className="grid grid-cols-2 items-stretch gap-2">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => safeRun(async () => setReset({ ...reset, debugCode: (await api('requestReset', { email: reset.email })).code }), 'Código enviado 📩')}
                    >
                      Enviar código
                    </button>
                    <span className="flex items-center justify-center rounded-xl bg-gold/15 px-2 text-xs text-ink/70 dark:text-rose-50/70">
                      Código local: {reset.debugCode || '-'}
                    </span>
                  </div>
                  <input placeholder="Código" className="input" value={reset.code} onChange={(e) => setReset({ ...reset, code: e.target.value })} />
                  <input placeholder="Nueva contraseña" type="password" className="input" value={reset.newPassword} onChange={(e) => setReset({ ...reset, newPassword: e.target.value })} />
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => safeRun(async () => {
                      await api('confirmReset', reset);
                      setResetOpen(false);
                    }, 'Contraseña actualizada ✅')}
                  >
                    Confirmar cambio
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="rounded-xl bg-wine/10 p-2.5 text-sm text-wine dark:bg-rose/15 dark:text-rose-200">{error}</p>}
            {notice && <p className="rounded-xl bg-gold/15 p-2.5 text-sm text-ink/80 dark:text-rose-50/85">{notice}</p>}
          </motion.form>
        </div>
      </main>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <main className="relative mx-auto min-h-screen max-w-6xl space-y-10 px-4 pb-24 pt-6 md:px-6">
      <AnimatePresence>
        {state.theme === 'night' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stars" />}
      </AnimatePresence>
      <FloatingHearts festive={festiveHearts} />

      {/* Capítulo I — el masthead: los nombres, el contador vivo y la frase del día */}
      <motion.header variants={heroStagger} initial="hidden" animate="visible" className="relative z-10 pt-2 md:pt-6" data-animate="hero">
        <motion.div variants={fadeChild} className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Hola, {user} · el archivo de nuestra historia</p>
          <div className="flex shrink-0 gap-2">
            <button
              className="btn-tiny"
              onClick={() => safeRun(async () => {
                await api('setTheme', { theme: state.theme === 'night' ? 'day' : 'night' });
                await refresh();
              }, `Modo ${state.theme === 'night' ? 'día' : 'noche'} activado`)}
            >
              {state.theme === 'night' ? '☀️ Día' : '🌙 Noche'}
            </button>
            <button
              className="btn-tiny"
              onClick={() => {
                setUser('');
                window.localStorage.removeItem('lelita_session_user');
              }}
            >
              Salir
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-14">
          <div>
            <motion.h1
              variants={riseChild}
              className="font-display text-5xl font-semibold italic leading-[1.05] text-wine dark:text-rose-100 md:text-7xl"
              data-animate="hero-title"
            >
              Jeicob <span className="not-italic text-rose">&amp;</span> Lelita
            </motion.h1>

            <motion.div variants={ruleDraw} style={{ transformOrigin: 'center' }} className="rule-heart my-6 max-w-lg" aria-hidden="true">
              <HeartIcon className="h-4 w-4" />
            </motion.div>

            <motion.p variants={riseChild} className="flex flex-wrap items-baseline gap-x-3" data-animate="hero-counter">
              <span className="font-display text-7xl font-semibold tabular-nums leading-none text-ink dark:text-rose-50 md:text-8xl">
                {shownDays}
              </span>
              <span className="font-display text-2xl italic text-ink/60 dark:text-rose-50/60 md:text-3xl">días juntos</span>
              <span className="beat self-center text-rose">
                <HeartIcon className="h-8 w-8 md:h-9 md:w-9" />
              </span>
            </motion.p>
            <motion.p variants={fadeChild} className="mt-2 text-sm text-ink/60 dark:text-rose-50/60">
              Desde el 13 de marzo de 2025 · {counters.years} {counters.years === 1 ? 'año' : 'años'}, {counters.months}{' '}
              {counters.months === 1 ? 'mes' : 'meses'} y {counters.day} {counters.day === 1 ? 'día' : 'días'} escribiendo esto juntos
            </motion.p>

            <motion.div variants={riseChild} className="mt-7" data-animate="phrase">
              <motion.p variants={wordStagger} className="font-hand text-3xl leading-snug text-wine dark:text-rose-100 md:text-4xl">
                {`“${state.phrase}”`.split(' ').map((word, i) => (
                  <motion.span key={`${i}-${word}`} variants={wordIn}>
                    {word}{' '}
                  </motion.span>
                ))}
              </motion.p>
              <button className="btn-tiny mt-3" onClick={() => setPhraseOpen((v) => !v)}>
                {phraseOpen ? 'Cerrar' : '✏️ Editar la frase de hoy'}
              </button>
              <AnimatePresence>
                {phraseOpen && (
                  <motion.div variants={collapse} initial="hidden" animate="visible" exit="hidden" className="max-w-lg overflow-hidden">
                    <textarea className="input mt-3 min-h-24" value={state.phrase} onChange={(e) => setState({ ...state, phrase: e.target.value })} />
                    <button
                      className="btn-primary mt-2"
                      onClick={() => safeRun(async () => {
                        await api('setPhrase', { phrase: state.phrase });
                        await refresh();
                      }, 'Frase guardada 📝')}
                    >
                      Guardar frase
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div variants={scaleIn} className="hidden sm:block">
            <PhotoStack size="lg" />
          </motion.div>
        </div>
      </motion.header>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-8">
        {/* Capítulo II — la galería como álbum de polaroids sobre el papel */}
        <motion.section
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="relative z-10 space-y-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader chapter="II" title="Nuestros recuerdos" note="lo que no queremos olvidar" />
            <input
              value={mediaFilter}
              onChange={(e) => {
                setVisibleCount(6);
                setMediaFilter(e.target.value);
              }}
              placeholder="🔍 Buscar recuerdos"
              className="input max-w-52"
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              safeRun(async () => {
                if (isPublishingMedia) return;
                setIsPublishingMedia(true);
                try {
                  if (!mediaFile) throw new Error('Selecciona una imagen o video local.');
                  const uploaded = await uploadLocalFile(mediaFile, 'media', media.type);
                  await api('addMedia', {
                    url: uploaded.url,
                    type: uploaded.type,
                    publicId: uploaded.publicId,
                    resourceType: uploaded.resourceType,
                    description: media.description,
                    author: user
                  });
                  setMedia({ type: 'image/jpeg', description: '' });
                  setMediaFile(null);
                  await refresh();
                } finally {
                  setIsPublishingMedia(false);
                }
              }, 'Recuerdo publicado 📸');
            }}
            className="space-y-2.5 rounded-[1.4rem] border border-dashed border-wine/30 bg-blush/40 p-4 backdrop-blur-sm dark:border-rose/30 dark:bg-white/[0.04]"
            data-animate="upload-form"
          >
            <p className="text-sm font-medium text-wine dark:text-rose-200">✨ Añadir al álbum</p>
            <input
              type="file"
              accept="image/*,video/*"
              className="input file:mr-3 file:rounded-full file:border-0 file:bg-wine file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-rose"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setMediaFile(file);
                if (file?.type) setMedia({ ...media, type: file.type });
              }}
            />
            <AnimatePresence>
              {mediaFile && (
                <motion.p variants={rowFade} initial="hidden" animate="visible" exit="hidden" className="text-xs text-ink/60 dark:text-rose-50/60">
                  Archivo seleccionado: {mediaFile.name}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
              <select className="input" value={media.type} onChange={(e) => setMedia({ ...media, type: e.target.value })}>
                <option value="image/jpeg">Imagen</option>
                <option value="video/mp4">Video</option>
              </select>
              <input placeholder="¿Qué momento es este?" className="input" value={media.description} onChange={(e) => setMedia({ ...media, description: e.target.value })} />
            </div>
            <button disabled={isPublishingMedia} className="btn-primary w-full">
              {isPublishingMedia ? 'Publicando…' : 'Publicar recuerdo'}
            </button>
          </form>

          <div className="columns-1 gap-4 md:columns-2">
            {visibleMedia.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: i % 2 === 0 ? -1.4 : 1.4,
                  // Cascada de 60ms solo en la entrada (cap 180ms); el hover usa el spring sin delay
                  transition: { ...polaroidSpring, delay: (i % 4) * 0.06 }
                }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                transition={polaroidSpring}
                className="polaroid relative"
                data-animate="polaroid"
              >
                <span className="tape" aria-hidden="true" />
                <button type="button" className="w-full" onClick={() => setLightboxId(item.id)}>
                  {item.type.startsWith('image') ? (
                    <img src={cld(item.url, 900)} alt={item.description} loading="lazy" className="max-h-96 w-full rounded-sm object-cover" />
                  ) : (
                    <video src={item.url} className="max-h-96 w-full rounded-sm object-cover" />
                  )}
                </button>
                <p className="mt-3 font-hand text-xl leading-tight text-ink dark:text-rose-50">{item.description}</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-rose-50/50">
                  {item.author} · {fmtDate(item.createdAt)}
                </p>
                {item.author === user && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="btn-tiny"
                      onClick={() => {
                        const description = prompt('Nueva descripción', item.description);
                        if (!description) return;
                        safeRun(async () => {
                          await api('editMedia', { id: item.id, description, user });
                          await refresh();
                        }, 'Descripción actualizada ✨');
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-tiny-danger"
                      onClick={() => safeRun(async () => {
                        const accepted = window.confirm('¿Seguro que deseas borrar este post y su archivo?');
                        if (!accepted) return;
                        await api('deleteMedia', { id: item.id, user });
                        await refresh();
                      }, 'Post eliminado 🗑️')}
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
          {!visibleMedia.length && (
            <p className="rounded-[1.4rem] bg-blush/50 p-6 text-center text-sm text-ink/60 dark:bg-white/5 dark:text-rose-50/60">
              {mediaFilter ? 'No hay recuerdos con esa descripción.' : 'Aún no hay recuerdos: sube el primero ✨'}
            </p>
          )}
        </motion.section>

        {/* Capítulo III — el correo del corazón */}
        <motion.section
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="relative z-10 space-y-5"
        >
          <SectionHeader chapter="III" title="Cartas secretas" note="correo del corazón" />

          <div className="card space-y-3">
            <p className="text-sm font-medium text-wine dark:text-rose-200">💌 Escribir una carta</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                safeRun(async () => {
                  await api('addLetter', { ...letter, author: user });
                  setLetter({ title: '', text: '', to: 'lelita' });
                  await refresh();
                }, 'Carta enviada 💌');
              }}
              className="space-y-2"
            >
              <input placeholder="Título" className="input" value={letter.title} onChange={(e) => setLetter({ ...letter, title: e.target.value })} />
              <textarea placeholder="Escribe aquí tu carta…" className="input min-h-24" value={letter.text} onChange={(e) => setLetter({ ...letter, text: e.target.value })} />
              <select className="input" value={letter.to} onChange={(e) => setLetter({ ...letter, to: e.target.value as 'jeicob' | 'lelita' })}>
                <option value="jeicob">Para Jeicob</option>
                <option value="lelita">Para Lelita</option>
              </select>
              <button className="btn-primary w-full">Enviar carta</button>
            </form>
          </div>

          <div className="card">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink dark:text-rose-50">Para ti, Jeicob</h3>
            <div className="space-y-4">
              {state.letters
                .filter((l: Letter) => l.to === 'jeicob' && (user === 'jeicob' || l.author === user))
                .map((l) => (
                  <motion.article
                    key={l.id}
                    variants={fadeRise}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    className="stationery text-sm"
                    data-animate="letter-card"
                  >
                    <motion.span variants={sealStamp} className="seal" aria-hidden="true">J♥L</motion.span>
                    <p className="pr-8 font-display text-base font-semibold text-wine dark:text-rose-200">{l.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-ink/80 dark:text-rose-50/80">{l.text}</p>
                    <p className="mt-2 font-hand text-base text-ink/60 dark:text-rose-50/60">— con amor, {l.author}</p>
                    {l.author === user && (
                      <button className="btn-tiny mt-2" onClick={() => editLetter(l)}>
                        Editar
                      </button>
                    )}
                  </motion.article>
                ))}
              {!state.letters.filter((l: Letter) => l.to === 'jeicob' && (user === 'jeicob' || l.author === user)).length && (
                <p className="text-sm text-ink/50 dark:text-rose-50/50">Todavía no hay cartas aquí.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink dark:text-rose-50">Para ti, Lelita</h3>
            <div className="space-y-4">
              {state.letters
                .filter((l: Letter) => l.to === 'lelita' && (user === 'lelita' || l.author === user))
                .map((l) => (
                  <motion.article
                    key={l.id}
                    variants={fadeRise}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    className="stationery text-sm"
                    data-animate="letter-card"
                  >
                    <motion.span variants={sealStamp} className="seal" aria-hidden="true">J♥L</motion.span>
                    <p className="pr-8 font-display text-base font-semibold text-wine dark:text-rose-200">{l.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-ink/80 dark:text-rose-50/80">{l.text}</p>
                    <p className="mt-2 font-hand text-base text-ink/60 dark:text-rose-50/60">— con amor, {l.author}</p>
                    {l.author === user && (
                      <button className="btn-tiny mt-2" onClick={() => editLetter(l)}>
                        Editar
                      </button>
                    )}
                  </motion.article>
                ))}
              {!state.letters.filter((l: Letter) => l.to === 'lelita' && (user === 'lelita' || l.author === user)).length && (
                <p className="text-sm text-ink/50 dark:text-rose-50/50">Todavía no hay cartas aquí.</p>
              )}
            </div>
          </div>

          <div className="card text-center" data-animate="qr-card">
            <p className="eyebrow mb-2">Colofón · llévanos contigo</p>
            <img src={qrUrl} alt="QR para abrir esta web en el móvil" className="mx-auto rounded-2xl border border-rose/20 bg-white p-2" />
            <p className="mt-2 text-xs text-ink/50 dark:text-rose-50/50">Escanéalo para abrir nuestro rincón en el móvil</p>
          </div>
        </motion.section>
      </div>

      {/* Capítulo IV — el chat solo para dos */}
      <motion.section
        variants={fadeRise}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="relative z-10 space-y-5"
        data-animate="chat"
      >
        <SectionHeader chapter="IV" title="Nuestro chat" note="solo para dos" />

        <div className="card">
          <div className="chat-scroll mb-3 flex max-h-96 flex-col gap-2.5 overflow-y-auto rounded-2xl border border-rose/15 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            {state.chat.map((m) => {
              const own = m.author === user;
              // Solo animan los mensajes nuevos (posteriores al mount) — nunca todo-a-la-vez
              const isNew = m.createdAt > chatMountedAt.current;
              return (
                <motion.div
                  key={m.id}
                  custom={own}
                  variants={bubbleIn}
                  initial={isNew ? 'hidden' : false}
                  animate="visible"
                  className={`flex max-w-[85%] items-end gap-2 md:max-w-[70%] ${own ? 'flex-row-reverse self-end' : 'self-start'}`}
                >
                  {!own && (
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose to-wine font-display text-xs font-semibold text-white"
                      title={m.author}
                      aria-hidden="true"
                    >
                      {m.author[0]?.toUpperCase()}
                    </span>
                  )}
                  <article
                    className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      own
                        ? 'rounded-br-md bg-gradient-to-br from-wine to-rose text-white'
                        : 'rounded-bl-md bg-white text-ink ring-1 ring-rose/15 dark:bg-white/10 dark:text-rose-50 dark:ring-white/10'
                    }`}
                    data-animate="chat-bubble"
                  >
                    {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                    {m.mediaUrl && (
                      <div className="mt-2">
                        {(m.mediaType || '').startsWith('video') ? (
                          <video src={m.mediaUrl} controls className="max-h-56 w-full rounded-xl object-cover" />
                        ) : (
                          <img src={cld(m.mediaUrl, 700)} alt="adjunto" loading="lazy" className="max-h-56 w-full rounded-xl object-cover" />
                        )}
                      </div>
                    )}
                    <div className={`mt-1 flex items-center gap-2 text-[11px] ${own ? 'text-white/70' : 'text-ink/45 dark:text-rose-50/45'}`}>
                      <span>{fmtDate(m.createdAt)}</span>
                      {own && (
                        <button
                          className="underline-offset-2 transition hover:underline"
                          onClick={() => safeRun(async () => {
                            const accepted = window.confirm('¿Seguro que deseas borrar este mensaje?');
                            if (!accepted) return;
                            await api('deleteChat', { id: m.id, user });
                            await refresh();
                          }, 'Mensaje eliminado 🗑️')}
                        >
                          Borrar
                        </button>
                      )}
                    </div>
                  </article>
                </motion.div>
              );
            })}
            {!state.chat.length && <p className="p-4 text-center text-sm text-ink/50 dark:text-rose-50/50">Escríbanse algo bonito para empezar 💬</p>}
          </div>
          <form
            className="grid gap-2 md:grid-cols-[1fr_190px_130px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              safeRun(async () => {
                if (isSendingChat) return;
                setIsSendingChat(true);
                try {
                  let mediaUrl = '';
                  let mediaType = chat.mediaType;
                  let mediaPublicId = '';
                  let mediaResourceType: 'image' | 'video' = chat.mediaType.startsWith('video') ? 'video' : 'image';

                  if (chatFile) {
                    const uploaded = await uploadLocalFile(chatFile, 'chat', chat.mediaType);
                    mediaUrl = uploaded.url;
                    mediaType = uploaded.type;
                    mediaPublicId = uploaded.publicId;
                    mediaResourceType = uploaded.resourceType === 'video' ? 'video' : 'image';
                  }

                  await api('addChat', { text: chat.text, mediaUrl, mediaType, mediaPublicId, mediaResourceType, author: user });
                  setChat({ text: '', mediaType: 'image/jpeg' });
                  setChatFile(null);
                  await refresh();
                } finally {
                  setIsSendingChat(false);
                }
              }, 'Mensaje enviado 💬');
            }}
          >
            <input className="input" placeholder="Escribe un mensaje bonito…" value={chat.text} onChange={(e) => setChat({ ...chat, text: e.target.value })} />
            <input
              type="file"
              accept="image/*,video/*"
              className="input file:mr-2 file:rounded-full file:border-0 file:bg-wine file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-rose"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setChatFile(file);
                if (file?.type) setChat({ ...chat, mediaType: file.type });
              }}
            />
            {chatFile && <p className="text-xs text-ink/60 dark:text-rose-50/60 md:col-span-4">Archivo adjunto: {chatFile.name}</p>}
            <select className="input" value={chat.mediaType} onChange={(e) => setChat({ ...chat, mediaType: e.target.value })}>
              <option value="image/jpeg">Imagen</option>
              <option value="video/mp4">Video</option>
            </select>
            <button disabled={isSendingChat} className="btn-primary px-5">
              {isSendingChat ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        </div>
      </motion.section>

      <footer className="relative z-10 pt-4 text-center" data-animate="footer">
        <motion.div
          variants={ruleDraw}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ transformOrigin: 'center' }}
          className="rule-heart mx-auto max-w-xs"
          aria-hidden="true"
        >
          <HeartIcon className="h-3.5 w-3.5" />
        </motion.div>
        <p className="mt-5 font-hand text-2xl text-wine/75 dark:text-rose-200/75">hecho con amor, para nosotros dos ♡</p>
        <p className="mt-1 text-xs text-ink/45 dark:text-rose-50/45">Desde el 13 de marzo de 2025 · siempre</p>
      </footer>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-30 bg-plum/90 p-4 backdrop-blur-sm md:p-6"
            onClick={() => setLightboxId(null)}
            data-animate="lightbox"
          >
            <motion.div
              variants={lightboxCard}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mx-auto mt-6 max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between text-xs text-white/80">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {lightboxIndex + 1} / {filteredMedia.length}
                </span>
                <div className="flex gap-2">
                  <button
                    aria-label="Anterior"
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 transition hover:bg-white/20"
                    onClick={() => setLightboxId(filteredMedia[(lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length]?.id || null)}
                  >
                    ←
                  </button>
                  <button
                    aria-label="Siguiente"
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 transition hover:bg-white/20"
                    onClick={() => setLightboxId(filteredMedia[(lightboxIndex + 1) % filteredMedia.length]?.id || null)}
                  >
                    →
                  </button>
                  <button
                    aria-label="Cerrar"
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 transition hover:bg-white/20"
                    onClick={() => setLightboxId(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={lightbox.id} variants={mediaSwap} initial="hidden" animate="visible" exit="hidden">
                  {lightbox.type.startsWith('image') ? (
                    <img src={cld(lightbox.url, 1600)} alt={lightbox.description} className="max-h-[72vh] w-full rounded-2xl object-contain" />
                  ) : (
                    <video src={lightbox.url} controls className="max-h-[72vh] w-full rounded-2xl object-contain" />
                  )}
                  {lightbox.description && (
                    <p className="mx-auto mt-4 w-fit rounded-full bg-white/90 px-5 py-2 text-center font-hand text-xl text-ink">{lightbox.description}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <AnimatePresence>
          {error && (
            <motion.p
              variants={toastPop}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="pointer-events-auto rounded-full bg-wine px-5 py-2.5 text-sm font-medium text-white shadow-lg"
              data-animate="toast"
            >
              {error}
            </motion.p>
          )}
          {notice && !error && (
            <motion.p
              variants={toastPop}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="pointer-events-auto rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-rose-50 shadow-lg dark:bg-rose dark:text-plum"
              data-animate="toast"
            >
              {notice}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </main>
    </MotionConfig>
  );
}
