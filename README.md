# Lelita's Photlibrary

Una web de una sola página (`index.html`) con estilo vintage/elegante (azules + beige/crema), pensada como diario infinito para Jeicob y Lelita.

## Funciones incluidas

- Login inicial por usuario (`jeicob` / `lelita`) con registro de correo y contraseña.
- Recuperación de contraseña por código (local o vía webhook de email).
- Contador desde `13/03/2025`:
  - Días transcurridos.
  - Tiempo de amistad en años/meses/días.
- Cartita editable “Frase de hoy” (abre/cierra al click).
- Feed de fotos/videos con scroll infinito (estilo collage/diario, tarjetas inclinadas).
- Cada foto/video tiene descripción editable por su autor.
- Lightbox al hacer click en foto/video para verlo grande con descripción.
- Secciones laterales de cartas secretas por destinatario:
  - “Cartas secretas para ti Jeicob”
  - “Cartas secretas para ti Lelita”
  - Solo el autor puede editar su carta, el destinatario solo la lee.
- Chat al final de la web con texto + imagen/video.
- Modo día / noche con estrellas.
- QR para abrir la web desde el móvil.

## Persistencia de datos

La app soporta dos modos:

1. **Local (rápido para pruebas):** usa `localStorage` del navegador.
2. **Nube (recomendado para producción):** usa MongoDB Data API y Cloudinary.

> Si no configuras MongoDB/Cloudinary, seguirá funcionando pero solo persistirá en el navegador local.

---

## Ejecutar en local

Como es un solo HTML, basta con un servidor estático:

```bash
python3 -m http.server 5173
```

Luego abre:

- `http://localhost:5173`

---

## Configuración para producción (Vercel + MongoDB Atlas + Cloudinary)

### 1) Subir a Vercel

- Crea un repo con estos archivos.
- Importa el repo en Vercel.
- Framework preset: **Other** (sitio estático).
- Deploy.

### 2) MongoDB Atlas Data API

1. En MongoDB Atlas, habilita **Data API**.
2. Crea una base de datos (ejemplo: `lelita`) y colección (ejemplo: `photlibrary_state`).
3. Crea API Key de Data API.
4. Dentro de la web, botón **⚙️ Config** y completa:
   - `Mongo Data API URL`: base tipo `https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1/action`
   - `Mongo Data API Key`
   - `Mongo Data Source` (ej: `Cluster0`)
   - `Mongo DB` (ej: `lelita`)
   - `Mongo Collection` (ej: `photlibrary_state`)

### 3) Cloudinary

1. Crea cuenta en Cloudinary.
2. Crea un **unsigned upload preset**.
3. En **⚙️ Config** completa:
   - `Cloudinary cloud name`
   - `Cloudinary unsigned upload preset`

Con esto, fotos/videos se suben a Cloudinary y no se pierden al cerrar sesión.

### 4) Recuperación de contraseña por email (opcional)

- La app puede enviar el código por webhook si configuras `Webhook de email`.
- Puedes implementar ese webhook con Vercel Functions + Resend/SendGrid.
- Si no configuras webhook, mostrará el código localmente para pruebas.

---

## Notas importantes de seguridad

- Este proyecto está orientado a regalo personal/MVP.
- Para uso real más seguro, se recomienda:
  - mover auth/email al backend,
  - no exponer API keys sensibles en frontend,
  - usar sesiones con JWT/cookies httpOnly,
  - aplicar validaciones y rate limiting.

