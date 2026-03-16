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
  const [phraseOpen, setPhraseOpen] = useState(true);
  const [reset, setReset] = useState({ email: '', code: '', newPassword: '', debugCode: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState('');
  const [counterNow, setCounterNow] = useState(Date.now());

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

  const uploadLocalFile = async (file: File, context: 'media' | 'chat', mediaType: string) => {
    const sign = await api('createCloudinarySignature', { context, mediaType });

    const cloudName = String(sign.cloudName);
    const apiKey = String(sign.apiKey);
    const timestamp = Number(sign.timestamp);
    const folder = String(sign.folder);
    const signature = String(sign.signature);
    const resourceType = String(sign.resourceType || (mediaType.startsWith('video') ? 'video' : 'image'));

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: form
    });

    const data = await res.json();
    if (!res.ok || data.error?.message || !data.secure_url) {
      throw new Error(data.error?.message || 'No se pudo subir el archivo a Cloudinary.');
    }

    const uploadedType = String(file.type || data.resource_type || mediaType || 'image/jpeg');
    return { url: String(data.secure_url), type: uploadedType };
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
      <main className="relative mx-auto flex min-h-screen max-w-xl items-center justify-center p-6">
        <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} onSubmit={doAuth} className="card w-full space-y-3">
          <h1 className="text-2xl font-bold text-primary">Lelita&apos;s Photlibrary</h1>
          <p className="text-sm text-slate-500">La versión más linda: login, recuerdos, cartas, chat, modo noche y más ✨</p>
          <select value={auth.username} onChange={(e) => setAuth({ ...auth, username: e.target.value })} className="w-full rounded-lg border p-2">
            <option value="jeicob">jeicob</option>
            <option value="lelita">lelita</option>
          </select>
          <input placeholder="Email" type="email" className="w-full rounded-lg border p-2" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
          <input placeholder="Contraseña" type="password" className="w-full rounded-lg border p-2" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
          <button className="w-full rounded-lg bg-primary p-2 font-semibold text-white">Entrar / Registrarme</button>

          <button type="button" onClick={() => setResetOpen((v) => !v)} className="w-full rounded-lg border p-2">Recuperar contraseña</button>
          <AnimatePresence>
            {resetOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                <input placeholder="Email" className="w-full rounded-lg border p-2" value={reset.email} onChange={(e) => setReset({ ...reset, email: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-lg border p-2"
                    onClick={() => safeRun(async () => setReset({ ...reset, debugCode: (await api('requestReset', { email: reset.email })).code }), 'Código enviado 📩')}
                  >
                    Enviar código
                  </button>
                  <span className="rounded-lg bg-amber-100 p-2 text-xs text-slate-700">Código local: {reset.debugCode || '-'}</span>
                </div>
                <input placeholder="Código" className="w-full rounded-lg border p-2" value={reset.code} onChange={(e) => setReset({ ...reset, code: e.target.value })} />
                <input placeholder="Nueva contraseña" type="password" className="w-full rounded-lg border p-2" value={reset.newPassword} onChange={(e) => setReset({ ...reset, newPassword: e.target.value })} />
                <button
                  type="button"
                  className="w-full rounded-lg bg-slate-900 p-2 text-white"
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

          {error && <p className="rounded-lg bg-red-100 p-2 text-sm text-red-700">{error}</p>}
          {notice && <p className="rounded-lg bg-emerald-100 p-2 text-sm text-emerald-700">{notice}</p>}
        </motion.form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-4 p-4">
      <AnimatePresence>
        {state.theme === 'night' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="stars" />}
      </AnimatePresence>

      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card z-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Hola, {user} ✨</h1>
          <p className="text-sm text-slate-500">{counters.days} días desde 13/03/2025</p>
          <p className="text-sm text-slate-500">{counters.years} años · {counters.months} meses · {counters.day} días</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => safeRun(async () => {
              await api('setTheme', { theme: state.theme === 'night' ? 'day' : 'night' });
              await refresh();
            }, `Modo ${state.theme === 'night' ? 'día' : 'noche'} activado`)}
          >
            {state.theme === 'night' ? '☀️ Día' : '🌙 Noche'}
          </button>
          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => {
              setUser('');
              window.localStorage.removeItem('lelita_session_user');
            }}
          >
            Salir
          </button>
        </div>
      </motion.header>

      <section className="card">
        <button className="mb-2 w-full rounded-lg border p-2 text-left font-semibold" onClick={() => setPhraseOpen((v) => !v)}>
          Frase de hoy {phraseOpen ? '▾' : '▸'}
        </button>
        <AnimatePresence>
          {phraseOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <textarea className="min-h-24 w-full rounded-lg border p-2" value={state.phrase} onChange={(e) => setState({ ...state, phrase: e.target.value })} />
              <button
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-white"
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
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <section className="card z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Feed de fotos/videos (scroll infinito)</h2>
            <input
              value={mediaFilter}
              onChange={(e) => {
                setVisibleCount(6);
                setMediaFilter(e.target.value);
              }}
              placeholder="Buscar en descripciones"
              className="rounded-lg border p-2 text-sm"
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              safeRun(async () => {
                if (!mediaFile) throw new Error('Selecciona una imagen o video local.');
                const uploaded = await uploadLocalFile(mediaFile, 'media', media.type);
                await api('addMedia', { url: uploaded.url, type: uploaded.type, description: media.description, author: user });
                setMedia({ type: 'image/jpeg', description: '' });
                setMediaFile(null);
                await refresh();
              }, 'Recuerdo publicado 📸');
            }}
            className="space-y-2"
          >
            <input
              key={mediaFile ? mediaFile.name : 'media-empty'}
              type="file"
              name="mediaFile"
              accept="image/*,video/*"
              className="w-full rounded-lg border p-2"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setMediaFile(file);
                if (file?.type) setMedia({ ...media, type: file.type });
              }}
            />
            {mediaFile && <p className="text-xs text-slate-500">Archivo seleccionado: {mediaFile.name}</p>}
            <select className="w-full rounded-lg border p-2" value={media.type} onChange={(e) => setMedia({ ...media, type: e.target.value })}>
              <option value="image/jpeg">Imagen</option>
              <option value="video/mp4">Video</option>
            </select>
            <input placeholder="Descripción" className="w-full rounded-lg border p-2" value={media.description} onChange={(e) => setMedia({ ...media, description: e.target.value })} />
            <button className="w-full rounded-lg bg-primary p-2 text-white">Publicar</button>
          </form>

          <div className="columns-1 gap-3 space-y-3 md:columns-2">
            {visibleMedia.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.2 : 1.2 }}
                className="mb-3 break-inside-avoid rounded-xl border bg-white/80 p-3"
              >
                <button type="button" className="w-full" onClick={() => setLightboxId(item.id)}>
                  {item.type.startsWith('image') ? (
                    <img src={item.url} alt={item.description} className="h-52 w-full rounded-lg object-cover" />
                  ) : (
                    <video src={item.url} className="h-52 w-full rounded-lg object-cover" />
                  )}
                </button>
                <p className="mt-2 text-sm">{item.description}</p>
                <p className="text-xs text-slate-500">{item.author} · {fmtDate(item.createdAt)}</p>
                {item.author === user && (
                  <button
                    className="mt-2 rounded-md border px-2 py-1 text-xs"
                    onClick={() => {
                      const description = prompt('Nueva descripción', item.description);
                      if (!description) return;
                      safeRun(async () => {
                        await api('editMedia', { id: item.id, description, user });
                        await refresh();
                      }, 'Descripción actualizada ✨');
                    }}
                  >
                    Editar descripción
                  </button>
                )}
              </motion.article>
            ))}
          </div>
          {!visibleMedia.length && <p className="text-sm text-slate-500">No hay resultados para el filtro.</p>}
        </section>

        <section className="space-y-4">
          <div className="card z-10 space-y-3">
            <h2 className="text-xl font-semibold">Cartas secretas</h2>
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
              <input placeholder="Título" className="w-full rounded-lg border p-2" value={letter.title} onChange={(e) => setLetter({ ...letter, title: e.target.value })} />
              <textarea placeholder="Texto" className="min-h-24 w-full rounded-lg border p-2" value={letter.text} onChange={(e) => setLetter({ ...letter, text: e.target.value })} />
              <select className="w-full rounded-lg border p-2" value={letter.to} onChange={(e) => setLetter({ ...letter, to: e.target.value as 'jeicob' | 'lelita' })}>
                <option value="jeicob">Para Jeicob</option>
                <option value="lelita">Para Lelita</option>
              </select>
              <button className="w-full rounded-lg bg-primary p-2 text-white">Guardar carta</button>
            </form>
          </div>

          <div className="card z-10">
            <h3 className="mb-2 font-semibold">Cartas secretas para ti Jeicob</h3>
            <div className="space-y-2">
              {state.letters
                .filter((l: Letter) => l.to === 'jeicob' && (user === 'jeicob' || l.author === user))
                .map((l) => (
                  <article key={l.id} className="rounded-lg border p-3 text-sm">
                    <strong>{l.title}</strong>
                    <p>{l.text}</p>
                    <p className="text-xs text-slate-500">de {l.author}</p>
                    {l.author === user && <button className="mt-1 rounded border px-2 py-1 text-xs" onClick={() => editLetter(l)}>Editar</button>}
                  </article>
                ))}
            </div>
          </div>

          <div className="card z-10">
            <h3 className="mb-2 font-semibold">Cartas secretas para ti Lelita</h3>
            <div className="space-y-2">
              {state.letters
                .filter((l: Letter) => l.to === 'lelita' && (user === 'lelita' || l.author === user))
                .map((l) => (
                  <article key={l.id} className="rounded-lg border p-3 text-sm">
                    <strong>{l.title}</strong>
                    <p>{l.text}</p>
                    <p className="text-xs text-slate-500">de {l.author}</p>
                    {l.author === user && <button className="mt-1 rounded border px-2 py-1 text-xs" onClick={() => editLetter(l)}>Editar</button>}
                  </article>
                ))}
            </div>
          </div>

          <div className="card z-10 text-center">
            <h3 className="mb-2 font-semibold">QR para abrir en móvil</h3>
            <img src={qrUrl} alt="QR para abrir esta web" className="mx-auto rounded-lg border bg-white p-2" />
          </div>
        </section>
      </div>

      <section className="card z-10">
        <h2 className="mb-2 text-xl font-semibold">Chat al final (texto + imagen/video)</h2>
        <div className="mb-3 max-h-80 space-y-2 overflow-y-auto rounded-lg border p-3">
          {state.chat.map((m) => (
            <article key={m.id} className="rounded-lg bg-amber-50 p-2 text-sm">
              <p><strong>{m.author}: </strong>{m.text}</p>
              {m.mediaUrl && (
                <div className="mt-2">
                  {(m.mediaType || '').startsWith('video') ? (
                    <video src={m.mediaUrl} controls className="h-44 w-full rounded-lg object-cover" />
                  ) : (
                    <img src={m.mediaUrl} alt="adjunto" className="h-44 w-full rounded-lg object-cover" />
                  )}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">{fmtDate(m.createdAt)}</p>
            </article>
          ))}
        </div>
        <form
          className="grid gap-2 md:grid-cols-[1fr_180px_150px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            safeRun(async () => {
              let mediaUrl = '';
              let mediaType = chat.mediaType;

              if (chatFile) {
                const uploaded = await uploadLocalFile(chatFile, 'chat', chat.mediaType);
                mediaUrl = uploaded.url;
                mediaType = uploaded.type;
              }

              await api('addChat', { text: chat.text, mediaUrl, mediaType, author: user });
              setChat({ text: '', mediaType: 'image/jpeg' });
              setChatFile(null);
              await refresh();
            }, 'Mensaje enviado 💬');
          }}
        >
          <input className="rounded-lg border p-2" placeholder="Escribe un mensaje" value={chat.text} onChange={(e) => setChat({ ...chat, text: e.target.value })} />
          <input
            key={chatFile ? chatFile.name : 'chat-empty'}
            type="file"
            name="chatFile"
            accept="image/*,video/*"
            className="rounded-lg border p-2"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setChatFile(file);
              if (file?.type) setChat({ ...chat, mediaType: file.type });
            }}
          />
          {chatFile && <p className="text-xs text-slate-500 md:col-span-4">Archivo adjunto: {chatFile.name}</p>}
          <select className="rounded-lg border p-2" value={chat.mediaType} onChange={(e) => setChat({ ...chat, mediaType: e.target.value })}>
            <option value="image/jpeg">Imagen</option>
            <option value="video/mp4">Video</option>
          </select>
          <button className="rounded-lg bg-primary px-4 text-white">Enviar</button>
        </form>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 bg-black/80 p-6" onClick={() => setLightboxId(null)}>
            <div className="mx-auto mt-8 max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-2 flex justify-between text-xs text-white/80">
                <span>{lightboxIndex + 1}/{filteredMedia.length}</span>
                <div className="flex gap-2">
                  <button
                    className="rounded border border-white/50 px-2 py-1"
                    onClick={() => setLightboxId(filteredMedia[(lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length]?.id || null)}
                  >
                    ←
                  </button>
                  <button
                    className="rounded border border-white/50 px-2 py-1"
                    onClick={() => setLightboxId(filteredMedia[(lightboxIndex + 1) % filteredMedia.length]?.id || null)}
                  >
                    →
                  </button>
                </div>
              </div>
              {lightbox.type.startsWith('image') ? (
                <img src={lightbox.url} alt={lightbox.description} className="max-h-[70vh] w-full rounded-xl object-contain" />
              ) : (
                <video src={lightbox.url} controls className="max-h-[70vh] w-full rounded-xl object-contain" />
              )}
              <p className="mt-3 rounded-lg bg-white/90 p-2 text-sm text-slate-900">{lightbox.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="sticky bottom-3 z-30 rounded-lg bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {notice && <p className="sticky bottom-3 z-30 rounded-lg bg-emerald-100 p-2 text-sm text-emerald-700">{notice}</p>}
    </main>
  );
}
