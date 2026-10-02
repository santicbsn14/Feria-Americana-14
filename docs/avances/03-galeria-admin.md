# 03 — Panel /admin: subir y borrar fotos de la galería

## Qué se hizo
- `POST /api/gallery-add` (`{ id, imageBase64 }`): valida auth, tipos, base64, JPEG por magic bytes
  (`FF D8 FF`) y tamaño ≤ 3 MB. Sube el asset y, en una sola transacción sobre el publicado y el draft
  (si existe), hace `setIfMissing({ gallery: [] })` + `append` con un `_key` aleatorio. Devuelve la
  galería actualizada `[{ key, url }]`.
- `POST /api/gallery-remove` (`{ id, key }`): valida `key` con `/^[a-zA-Z0-9_-]+$/` antes de armar el
  path, hace `unset(['gallery[_key=="<key>"]'])` en publicado + draft en una transacción y después
  intenta borrar el asset huérfano (si Sanity lo rechaza porque se usa en otro lado, se ignora).
  Devuelve la galería actualizada.
- Compresión en el navegador (`compressImage.ts`): canvas, lado más largo ≤ 1600px sin agrandar,
  JPEG 0.82, respetando la orientación EXIF. Si no se puede decodificar → "Formato de imagen no soportado".
- Query del admin con `"gallery": gallery[]{ "key": _key, "url": asset->url }`. `getProducts()` no cambió.
- `adminApi.ts`: `addGalleryImage(id, file, password)` y `removeGalleryImage(id, key, password)`.
- UI: botón "Fotos (N)" en cada fila que abre `AdminGallery` (pantalla completa en el celular, modal
  centrado desde 640px). Muestra la foto principal marcada "Principal" sin acciones, la grilla de la
  galería, borrado con confirmación y "Agregar fotos" con selección múltiple. Las fotos se suben de a
  una ("Subiendo 2 de 3…") y si una falla se avisa cuál y se sigue con las demás.

## Archivos creados y modificados
Creados:
- `api/gallery-add.ts`
- `api/gallery-remove.ts`
- `api/_lib/product.ts` (`isProductId`, `findProductTargets`, `getGallery`)
- `api/_lib/http.ts` (`requirePost`, `requireWriteToken`, `parseBody`)
- `src/lib/compressImage.ts`
- `src/components/admin/AdminGallery.tsx`
- `docs/avances/03-galeria-admin.md`

Modificados:
- `api/toggle-available.ts`: refactor para usar `api/_lib/` (mismo comportamiento, ver Decisiones).
- `src/lib/queries.ts`: tipo `AdminGalleryImage`, campo `gallery` en `AdminProduct` y en la query del admin.
- `src/lib/adminApi.ts`: funciones de galería y mensaje claro ante un 413.
- `src/components/admin/AdminProductRow.tsx`: botón "Fotos (N)".
- `src/components/admin/AdminPage.tsx`: estado del modal y actualización de la galería en la lista.
- `src/styles/admin.css`: estilos del modal, la grilla y los botones nuevos.

## Decisiones tomadas durante la implementación
- **Extracción a `api/_lib/`** (lo permitía el brief): la verificación "existe el publicado + traer
  draft" quedó en `findProductTargets(id)`, que devuelve `null` (→ 404) o los ids a patchear
  (`[id]` o `[id, drafts.id]`). También se extrajeron `requirePost`, `requireWriteToken` y `parseBody`.
  `toggle-available` mantiene exactamente el mismo orden de validaciones y respuestas
  (405 → 401 → 500 sin token → 400 → 404 → 200/500). Se verificó con los casos de prueba de abajo.
  `admin-login` no se tocó.
- **EXIF**: no se parsea el EXIF a mano. Se decodifica con `<img>` y se dibuja en el canvas. Los
  navegadores actuales (Chrome/Edge 81+, Safari 13.1+, Firefox 77+) ya aplican la orientación EXIF en
  ese proceso, y `naturalWidth/Height` vienen rotados. En navegadores más viejos la foto podría quedar girada.
- Fondo blanco en el canvas antes de dibujar: un PNG con transparencia quedaría negro en JPEG.
- **Límites de tamaño**: el cliente también rechaza si el JPEG comprimido supera 3 MB (con 1600px y
  calidad 0.82 una foto típica queda en 300–700 KB, muy lejos del límite). El servidor revisa el largo
  del base64 *antes* de decodificar y después el tamaño real del buffer.
  Si Vercel corta por superar 4,5 MB (413, sin JSON), el panel muestra "La foto pesa demasiado".
- `_key` con `randomBytes(6).toString('hex')` (12 caracteres hex, mismo formato que genera el Studio).
- El asset se sube con `filename: <id>-<timestamp>.jpg` para identificarlo en la Media Library del Studio.
- La galería que devuelven los endpoints se lee del **publicado**, después de la transacción
  (cliente sin CDN, así que la lectura ya incluye el cambio).
- En `gallery-remove`, los assets a borrar se buscan en el publicado y en el draft antes del `unset`.
  Si la `key` no existe, el `unset` no hace nada y se devuelve la galería igual (idempotente, por si
  se toca dos veces).
- **Ítems vacíos**: en los datos actuales hay 4 ítems de galería sin imagen (`asset` vacío, quedaron
  así desde el Studio). Se muestran como "Sin imagen" y se pueden borrar. Cuentan en "Fotos (N)".
- **Confirmación de borrado**: es un overlay sobre la miniatura ("¿Borrar esta foto?" + Borrar/Cancelar)
  en vez de `window.confirm`, que en algunos navegadores móviles se ve mal o se bloquea.
- **Mientras hay una subida o borrado en curso**, se deshabilitan todos los botones de la galería,
  *incluido cerrar el modal* (y Escape), para que no parezca que se canceló algo que sigue corriendo.
- El contador "Fotos (N)" se actualiza en la fila con cada foto subida o borrada, no solo al cerrar.
- El modal bloquea el scroll de la página de fondo y enfoca el botón de cerrar al abrirse.

## Desvíos respecto al brief
Ninguno.

## Pendientes o problemas encontrados
- **No se probó de punta a punta** (subir/borrar de verdad desde el panel): sigue faltando
  `ADMIN_PASSWORD` y el `vercel link` para levantar `vercel dev`, y no se hicieron escrituras en
  producción sin confirmación. Sí se verificó:
  - `npm run build` pasa y `dist/` no contiene el token, la contraseña ni los nombres de las variables.
  - `eslint` sin errores en `src/components/admin`, `src/lib` y `api`. Hay 2 errores previos en
    `ProductGrid.tsx` y `CartContext.tsx`, que no son de este brief.
  - Typecheck de `/api` OK.
  - Casos de error de los tres endpoints, llamando a los handlers con req/res simulados contra Sanity
    real, sin escribir nada: 405, 401 (sin contraseña / mala), 400 (sin imagen, id `drafts.`, PNG,
    base64 roto, > 3 MB, `key` vacía, `key` con `"] || true`, tipos mal en toggle) y 404 (id inexistente).
    Todos dieron el código esperado.
  - Las queries GROQ de galería y de assets se probaron en modo lectura contra productos reales.
- **Fotos huérfanas posibles**: si la subida del asset sale bien pero falla la transacción, el asset
  queda subido sin referencia. Es raro y no molesta, se puede limpiar desde la Media Library.
- **Cámara en Android**: con `multiple`, algunas versiones de Android muestran solo la galería y no
  ofrecen "Cámara" en el selector. En iPhone ofrece las dos. Si Valentino lo necesita, se puede sumar
  un segundo botón "Sacar foto" con `capture="environment"` (sin `multiple`).
- **HEIC**: en iPhone, Safari convierte a JPEG al elegir la foto, así que funciona. En Android, un HEIC
  da "Formato de imagen no soportado", como pide el brief.

## Cómo probarlo
1. Completar `ADMIN_PASSWORD` en `.env`, `vercel link` (una vez) y `vercel dev`.
2. En `localhost:3000/admin`, en un producto **sin galería**: "Fotos (0)" → "Agregar fotos" → elegir
   una foto de celular de varios MB. Debe aparecer en la grilla y el contador pasar a 1.
3. Elegir 3 fotos a la vez: ver "Subiendo 1 de 3…", "2 de 3…", y las 3 en la grilla.
4. Incluir un archivo que no sea imagen (o un HEIC en Android): avisa cuál falló y sube las demás.
5. Verificar que las fotos verticales no quedan giradas (en el panel y en `/producto/<id>`).
6. Studio: la galería del producto muestra las fotos, sin el aviso de "missing keys".
7. Borrar una foto (× → "¿Borrar esta foto?" → Borrar): desaparece del panel, del Studio y (tras
   unos segundos por el CDN) de `/producto/<id>`. En la Media Library el asset ya no está, salvo
   que se use en otro producto.
8. Cerrar el modal: "Fotos (N)" de la fila coincide.
9. Con `vercel dev` corriendo:
   ```bash
   curl -i -X POST localhost:3000/api/gallery-add -H "Content-Type: application/json" -d '{"id":"x","imageBase64":"x"}'   # 401
   curl -i -X POST localhost:3000/api/gallery-remove -H "Content-Type: application/json" \
     -H "x-admin-password: <la-buena>" -d '{"id":"<id>","key":"a\"] || true"}'                                        # 400
   curl -i -X POST localhost:3000/api/gallery-remove -H "Content-Type: application/json" \
     -H "x-admin-password: <la-buena>" -d '{"id":"no-existe","key":"abc"}'                                             # 404
   ```
10. Cambiar `ADMIN_PASSWORD`, reiniciar `vercel dev` e intentar subir: vuelve al login.
11. Tocar un switch Disponible/Vendido: sigue funcionando igual.
12. DevTools a 360px: el modal ocupa toda la pantalla, el botón "Agregar fotos" queda fijo abajo y
    todo se toca cómodo.
13. `npm run build` y buscar en `dist/` el token, la contraseña y los nombres de las variables: no debe aparecer ninguno.
