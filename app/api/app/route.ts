import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getState, withState } from '@/lib/store';
import { Letter } from '@/lib/types';

const uid = () => Math.random().toString(36).slice(2, 10);

type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type MailTransporter = {
  sendMail: (options: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

let transporter: MailTransporter | null = null;

const getTransporter = (): MailTransporter => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Faltan variables SMTP_HOST, SMTP_USER o SMTP_PASS para enviar email.');
  }

  const secure = String(process.env.SMTP_SECURE || 'false') === 'true' || port === 465;

  try {
    const req = eval('require') as NodeRequire;
    const nodemailer = req('nodemailer') as {
      createTransport: (cfg: {
        host: string;
        port: number;
        secure: boolean;
        auth: { user: string; pass: string };
      }) => MailTransporter;
    };

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    return transporter;
  } catch {
    throw new Error('No se encontró "nodemailer". Instálalo con: npm install nodemailer');
  }
};

const maybeSendResetEmail = async (email: string, code: string) => {
  const from = process.env.SMTP_FROM;

  if (!from || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return false;

  const message: SendMailOptions = {
    to: email,
    subject: 'Código de recuperación - Lelita Photlibrary',
    text: `Tu código de recuperación es: ${code}. Expira en 10 minutos.`,
    html: `<p>Tu código de recuperación es: <strong>${code}</strong>.</p><p>Expira en <strong>10 minutos</strong>.</p>`
  };

  const emailTransport = getTransporter();
  await emailTransport.sendMail({ from, ...message });
  return true;
};

const maybeSendResetWebhook = async (email: string, code: string) => {
  const url = process.env.RESET_EMAIL_WEBHOOK_URL;
  if (!url) return false;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, subject: 'Código de recuperación' })
  });

  return true;
};

const sendResetCode = async (email: string, code: string) => {
  const sentByEmail = await maybeSendResetEmail(email, code);
  if (sentByEmail) return 'smtp';

  const sentByWebhook = await maybeSendResetWebhook(email, code);
  if (sentByWebhook) return 'webhook';

  return 'debug';
};

type CloudinaryResourceType = 'image' | 'video';

type CloudinaryUploadResult = {
  secure_url: string;
  resource_type: CloudinaryResourceType;
  format?: string;
};

const uploadToCloudinary = async (fileDataUrl: string, resourceType: CloudinaryResourceType, folderSuffix: 'media' | 'chat'): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'lelita';

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${baseFolder}/${folderSuffix}`;
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(`${paramsToSign}${apiSecret}`).digest('hex');

  const form = new FormData();
  form.append('file', fileDataUrl);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: form
  });

  const data = (await res.json()) as CloudinaryUploadResult & { error?: { message?: string } };
  if (!res.ok || data.error?.message || !data.secure_url) {
    throw new Error(data.error?.message || 'Error subiendo archivo a Cloudinary.');
  }

  return data;
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

          // Respuesta uniforme para no filtrar si el correo existe o no.
          if (!entry) {
            return { ok: true, delivery: 'noop' };
          }

          const code = String(Math.floor(100000 + Math.random() * 900000));
          state.resetCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };

          const delivery = await sendResetCode(email, code);
          const isProd = process.env.NODE_ENV === 'production';

          return {
            ok: true,
            delivery,
            code: isProd && delivery !== 'debug' ? undefined : code
          };
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


        case 'uploadFile': {
          const fileDataUrl = String(payload.fileDataUrl || '');
          const mediaType = String(payload.mediaType || 'image/jpeg');
          const context = payload.context === 'chat' ? 'chat' : 'media';

          if (!fileDataUrl.startsWith('data:')) {
            throw new Error('Archivo inválido. Debes subir un archivo local.');
          }

          const resourceType: CloudinaryResourceType = mediaType.startsWith('video') ? 'video' : 'image';
          const uploaded = await uploadToCloudinary(fileDataUrl, resourceType, context);
          const resolvedType = uploaded.format ? `${resourceType}/${uploaded.format}` : mediaType;

          return { ok: true, url: uploaded.secure_url, type: resolvedType };
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
