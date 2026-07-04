'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppState, Letter, MediaItem } from '@/lib/types';

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

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

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

const FloatingHearts = () => (
  <div className="hearts" aria-hidden="true">
    {heartConfigs.map((h, i) => (
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
  const dims = size === 'lg' ? 'w-40 md:w-48' : 'w-28 md:w-32';
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <div className={`keepsake floaty ${dims} -rotate-6`} style={{ ['--tilt' as string]: '-6deg' }}>
        <img src="/img/imagen1.jpeg" alt="" className="aspect-[3/4] w-full rounded-sm object-cover" />
      </div>
      <div className={`keepsake floaty-late ${dims} -ml-8 mt-8 rotate-6`} style={{ ['--tilt' as string]: '6deg' }}>
        <img src="/img/imagen2.jpeg" alt="" className="aspect-[3/4] w-full rounded-sm object-cover" />
      </div>
    </div>
  );
};

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
      <main className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center overflow-hidden p-6">
        <FloatingHearts />

        <div className="relative z-10 grid w-full items-center gap-10 md:grid-cols-[1fr_auto]">
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onSubmit={doAuth}
            className="card w-full max-w-md space-y-4 p-7 md:justify-self-end"
          >
            <div className="space-y-1">
              <p className="eyebrow">Desde el 13 de marzo de 2025</p>
              <h1 className="font-display text-4xl font-semibold italic text-wine dark:text-rose-200">
                Jeicob <span className="text-rose">&amp;</span> Lelita
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
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
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

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="hidden md:block"
          >
            <PhotoStack size="lg" />
            <p className="mt-8 text-center font-hand text-2xl text-wine/80 dark:text-rose-200/80">nuestra historia favorita ♡</p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl space-y-5 px-4 pb-24 pt-6">
      <AnimatePresence>
        {state.theme === 'night' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stars" />}
      </AnimatePresence>
      <FloatingHearts />

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="card z-10 overflow-hidden p-6 md:p-8"
      >
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <p className="eyebrow">Hola, {user} · nuestro rincón</p>
            <p className="font-display text-5xl font-semibold text-wine dark:text-rose-100 md:text-6xl">
              {counters.days}{' '}
              <span className="text-3xl font-normal italic text-ink/70 dark:text-rose-50/70 md:text-4xl">días juntos</span>{' '}
              <span className="beat align-middle text-rose">
                <HeartIcon className="h-8 w-8 md:h-9 md:w-9" />
              </span>
            </p>
            <p className="text-sm text-ink/60 dark:text-rose-50/60">
              Desde el 13 de marzo de 2025 · {counters.years} {counters.years === 1 ? 'año' : 'años'}, {counters.months} {counters.months === 1 ? 'mes' : 'meses'} y {counters.day} {counters.day === 1 ? 'día' : 'días'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                className="btn-ghost"
                onClick={() => safeRun(async () => {
                  await api('setTheme', { theme: state.theme === 'night' ? 'day' : 'night' });
                  await refresh();
                }, `Modo ${state.theme === 'night' ? 'día' : 'noche'} activado`)}
              >
                {state.theme === 'night' ? '☀️ Día' : '🌙 Noche'}
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setUser('');
                  window.localStorage.removeItem('lelita_session_user');
                }}
              >
                Salir
              </button>
            </div>
          </div>
          <div className="hidden sm:block">
            <PhotoStack />
          </div>
        </div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="card z-10 p-6 text-center"
      >
        <p className="eyebrow mb-2">Frase de hoy</p>
        <p className="font-hand text-3xl leading-snug text-wine dark:text-rose-100 md:text-4xl">“{state.phrase}”</p>
        <button className="btn-tiny mt-3" onClick={() => setPhraseOpen((v) => !v)}>
          {phraseOpen ? 'Cerrar' : '✏️ Editar frase'}
        </button>
        <AnimatePresence>
          {phraseOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
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
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="card z-10 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="eyebrow">Galería</p>
              <h2 className="font-display text-2xl font-semibold text-ink dark:text-rose-50">Nuestros recuerdos</h2>
            </div>
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
            className="space-y-2 rounded-2xl border border-dashed border-wine/30 bg-blush/40 p-4 dark:border-rose/30 dark:bg-white/[0.04]"
          >
            <p className="text-sm font-medium text-wine dark:text-rose-200">✨ Guarda un nuevo recuerdo</p>
            <input
              type="file"
              accept="image/*,video/*"
              className="input file:mr-3 file:rounded-lg file:border-0 file:bg-wine file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-rose"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setMediaFile(file);
                if (file?.type) setMedia({ ...media, type: file.type });
              }}
            />
            {mediaFile && <p className="text-xs text-ink/60 dark:text-rose-50/60">Archivo seleccionado: {mediaFile.name}</p>}
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
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.4 : 1.4 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="polaroid relative"
              >
                <span className="tape" aria-hidden="true" />
                <button type="button" className="w-full" onClick={() => setLightboxId(item.id)}>
                  {item.type.startsWith('image') ? (
                    <img src={item.url} alt={item.description} loading="lazy" className="max-h-96 w-full rounded-sm object-cover" />
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
            <p className="rounded-2xl bg-blush/50 p-6 text-center text-sm text-ink/60 dark:bg-white/5 dark:text-rose-50/60">
              {mediaFilter ? 'No hay recuerdos con esa descripción.' : 'Aún no hay recuerdos: sube el primero ✨'}
            </p>
          )}
        </section>

        <section className="space-y-5">
          <div className="card z-10 space-y-3">
            <div>
              <p className="eyebrow">Correo del corazón</p>
              <h2 className="font-display text-2xl font-semibold text-ink dark:text-rose-50">Cartas secretas</h2>
            </div>
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
              <button className="btn-primary w-full">💌 Enviar carta</button>
            </form>
          </div>

          <div className="card z-10">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink dark:text-rose-50">Para ti, Jeicob</h3>
            <div className="space-y-3">
              {state.letters
                .filter((l: Letter) => l.to === 'jeicob' && (user === 'jeicob' || l.author === user))
                .map((l) => (
                  <article key={l.id} className="stationery text-sm">
                    <p className="font-display text-base font-semibold text-wine dark:text-rose-200">{l.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-ink/80 dark:text-rose-50/80">{l.text}</p>
                    <p className="mt-2 text-xs italic text-ink/50 dark:text-rose-50/50">— con amor, {l.author}</p>
                    {l.author === user && (
                      <button className="btn-tiny mt-2" onClick={() => editLetter(l)}>
                        Editar
                      </button>
                    )}
                  </article>
                ))}
              {!state.letters.filter((l: Letter) => l.to === 'jeicob' && (user === 'jeicob' || l.author === user)).length && (
                <p className="text-sm text-ink/50 dark:text-rose-50/50">Todavía no hay cartas aquí.</p>
              )}
            </div>
          </div>

          <div className="card z-10">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink dark:text-rose-50">Para ti, Lelita</h3>
            <div className="space-y-3">
              {state.letters
                .filter((l: Letter) => l.to === 'lelita' && (user === 'lelita' || l.author === user))
                .map((l) => (
                  <article key={l.id} className="stationery text-sm">
                    <p className="font-display text-base font-semibold text-wine dark:text-rose-200">{l.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-ink/80 dark:text-rose-50/80">{l.text}</p>
                    <p className="mt-2 text-xs italic text-ink/50 dark:text-rose-50/50">— con amor, {l.author}</p>
                    {l.author === user && (
                      <button className="btn-tiny mt-2" onClick={() => editLetter(l)}>
                        Editar
                      </button>
                    )}
                  </article>
                ))}
              {!state.letters.filter((l: Letter) => l.to === 'lelita' && (user === 'lelita' || l.author === user)).length && (
                <p className="text-sm text-ink/50 dark:text-rose-50/50">Todavía no hay cartas aquí.</p>
              )}
            </div>
          </div>

          <div className="card z-10 text-center">
            <p className="eyebrow mb-2">Llévanos contigo</p>
            <img src={qrUrl} alt="QR para abrir esta web en el móvil" className="mx-auto rounded-xl border border-rose/20 bg-white p-2" />
            <p className="mt-2 text-xs text-ink/50 dark:text-rose-50/50">Escanéalo para abrir nuestro rincón en el móvil</p>
          </div>
        </section>
      </div>

      <section className="card z-10">
        <div className="mb-3">
          <p className="eyebrow">Solo para dos</p>
          <h2 className="font-display text-2xl font-semibold text-ink dark:text-rose-50">Nuestro chat</h2>
        </div>
        <div className="chat-scroll mb-3 flex max-h-96 flex-col gap-2 overflow-y-auto rounded-2xl border border-rose/15 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          {state.chat.map((m) => {
            const own = m.author === user;
            return (
              <article
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm md:max-w-[70%] ${
                  own
                    ? 'self-end rounded-br-md bg-gradient-to-br from-wine to-rose text-white'
                    : 'self-start rounded-bl-md bg-white text-ink ring-1 ring-rose/15 dark:bg-white/10 dark:text-rose-50 dark:ring-white/10'
                }`}
              >
                {!own && <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide opacity-60">{m.author}</p>}
                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                {m.mediaUrl && (
                  <div className="mt-2">
                    {(m.mediaType || '').startsWith('video') ? (
                      <video src={m.mediaUrl} controls className="max-h-56 w-full rounded-xl object-cover" />
                    ) : (
                      <img src={m.mediaUrl} alt="adjunto" loading="lazy" className="max-h-56 w-full rounded-xl object-cover" />
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
            className="input file:mr-2 file:rounded-lg file:border-0 file:bg-wine file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-rose"
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
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-plum/90 p-4 backdrop-blur-sm md:p-6"
            onClick={() => setLightboxId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
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
                    className="rounded-full border border-white/30 px-3.5 py-1.5 transition hover:bg-white/15"
                    onClick={() => setLightboxId(filteredMedia[(lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length]?.id || null)}
                  >
                    ←
                  </button>
                  <button
                    aria-label="Siguiente"
                    className="rounded-full border border-white/30 px-3.5 py-1.5 transition hover:bg-white/15"
                    onClick={() => setLightboxId(filteredMedia[(lightboxIndex + 1) % filteredMedia.length]?.id || null)}
                  >
                    →
                  </button>
                  <button
                    aria-label="Cerrar"
                    className="rounded-full border border-white/30 px-3.5 py-1.5 transition hover:bg-white/15"
                    onClick={() => setLightboxId(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {lightbox.type.startsWith('image') ? (
                <img src={lightbox.url} alt={lightbox.description} className="max-h-[72vh] w-full rounded-2xl object-contain" />
              ) : (
                <video src={lightbox.url} controls className="max-h-[72vh] w-full rounded-2xl object-contain" />
              )}
              {lightbox.description && (
                <p className="mx-auto mt-4 w-fit rounded-full bg-white/90 px-5 py-2 text-center font-hand text-xl text-ink">{lightbox.description}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="pointer-events-auto rounded-full bg-wine px-5 py-2.5 text-sm font-medium text-white shadow-lg"
            >
              {error}
            </motion.p>
          )}
          {notice && !error && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="pointer-events-auto rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-rose-50 shadow-lg dark:bg-rose dark:text-plum"
            >
              {notice}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
