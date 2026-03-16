import { NextRequest, NextResponse } from 'next/server';
import { getState, withState } from '@/lib/store';
import { Letter } from '@/lib/types';

const uid = () => Math.random().toString(36).slice(2, 10);

const maybeSendResetWebhook = async (email: string, code: string) => {
  const url = process.env.RESET_EMAIL_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, subject: 'Código de recuperación' })
  });
};

export async function GET() {
  const state = await getState();
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await withState(async (state) => {
      const { action, payload } = body;

      switch (action) {
        case 'auth': {
          const username = String(payload.username || '').toLowerCase();
          if (!['jeicob', 'lelita'].includes(username)) throw new Error('Usuario no permitido.');
          const email = String(payload.email || '').toLowerCase();
          const password = String(payload.password || '');
          if (!email || !password) throw new Error('Falta email o contraseña.');

          if (!state.users[username]) {
            state.users[username] = { email, password };
          } else if (state.users[username].email !== email || state.users[username].password !== password) {
            throw new Error('Credenciales incorrectas.');
          }

          return { ok: true, user: username };
        }

        case 'requestReset': {
          const email = String(payload.email || '').toLowerCase();
          const entry = Object.entries(state.users).find(([, u]) => u.email.toLowerCase() === email);
          if (!entry) throw new Error('Email no encontrado.');
          const code = String(Math.floor(100000 + Math.random() * 900000));
          state.resetCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
          await maybeSendResetWebhook(email, code);
          return { ok: true, code };
        }

        case 'confirmReset': {
          const email = String(payload.email || '').toLowerCase();
          const code = String(payload.code || '');
          const newPassword = String(payload.newPassword || '');
          const reset = state.resetCodes[email];
          if (!reset || reset.code !== code || reset.expires < Date.now()) throw new Error('Código inválido o expirado.');
          const user = Object.entries(state.users).find(([, u]) => u.email.toLowerCase() === email);
          if (!user) throw new Error('Email no encontrado.');
          state.users[user[0]].password = newPassword;
          delete state.resetCodes[email];
          return { ok: true };
        }

        case 'setPhrase': {
          state.phrase = String(payload.phrase || '');
          return { ok: true };
        }

        case 'setTheme': {
          state.theme = payload.theme === 'night' ? 'night' : 'day';
          return { ok: true };
        }

        case 'addMedia': {
          const url = String(payload.url || '');
          const description = String(payload.description || '');
          const author = String(payload.author || '');
          const type = String(payload.type || 'image/jpeg');
          if (!url || !description || !author) throw new Error('Completa URL, descripción y autor.');
          const item = {
            id: uid(),
            createdAt: Date.now(),
            url,
            description,
            author,
            type
          };
          state.media.unshift(item);
          return { ok: true, item };
        }

        case 'editMedia': {
          const item = state.media.find((m) => m.id === payload.id);
          if (!item) throw new Error('Media no encontrado.');
          if (item.author !== payload.user) throw new Error('Sin permisos.');
          item.description = String(payload.description || '');
          return { ok: true };
        }

        case 'addLetter': {
          const title = String(payload.title || '');
          const text = String(payload.text || '');
          const author = String(payload.author || '');
          const to = payload.to === 'jeicob' ? 'jeicob' : 'lelita';
          if (!title || !text || !author) throw new Error('Completa título, texto y autor.');
          const letter: Letter = { id: uid(), createdAt: Date.now(), title, text, author, to };
          state.letters.unshift(letter);
          return { ok: true, letter };
        }

        case 'editLetter': {
          const letter = state.letters.find((l) => l.id === payload.id);
          if (!letter) throw new Error('Carta no encontrada.');
          if (letter.author !== payload.user) throw new Error('Sin permisos.');
          letter.title = String(payload.title || '');
          letter.text = String(payload.text || '');
          return { ok: true };
        }

        case 'addChat': {
          const text = String(payload.text || '');
          const author = String(payload.author || '');
          const mediaUrl = String(payload.mediaUrl || '');
          const mediaType = String(payload.mediaType || '');
          if (!author || (!text && !mediaUrl)) throw new Error('El mensaje no puede estar vacío.');
          const message = { id: uid(), createdAt: Date.now(), text, author, mediaUrl, mediaType };
          state.chat.push(message);
          return { ok: true, message };
        }

        default:
          throw new Error('Acción desconocida.');
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
