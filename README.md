# Lelita's Photlibrary (Next.js Fullstack)

Aplicación romántica hecha con **Next.js + React + Tailwind + Framer Motion**, pensada para verse hermosa en desktop y móvil.

## Funcionalidades principales

- Login inicial por usuario (`jeicob` / `lelita`) con registro por email + contraseña.
- Recuperación de contraseña por código (local y opcional por webhook de email).
- Contador desde `13/03/2025`:
  - días transcurridos,
  - años/meses/días.
- Cartita editable **Frase de hoy** con abrir/cerrar al click.
- Feed de fotos/videos con **scroll infinito**, estilo collage/diario con tarjetas inclinadas.
- Buscador por descripción en el feed.
- Edición de descripción por autor.
- **Lightbox** con navegación siguiente/anterior para media grande + descripción.
- Cartas secretas separadas para Jeicob y Lelita, con control de edición por autor.
- Chat al final con texto + imagen/video (URL).
- Modo día/noche con estrellas animadas.
- QR para abrir en móvil.
- Mensajes visuales de éxito/error para mejor UX.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir: `http://localhost:3000`

## Webhook opcional para recuperación por email

Si defines la variable de entorno:

```bash
RESET_EMAIL_WEBHOOK_URL=https://tu-webhook.com/reset
```

al solicitar recuperación, la API enviará `POST` con `{ email, code, subject }`.

## Producción

```bash
npm run build
npm run start
```

> Persistencia actual: `data/state.json` (MVP). Para producción real multiusuario, migrar a DB + auth/sesiones robustas.
