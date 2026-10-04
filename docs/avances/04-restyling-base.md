# 04 — Restyling: base visual (tokens, tipografías, logo)

Rama: `restyling`.

## Qué se hizo
- `global.css`:
  - Tokens nuevos en `:root`: color (`--ink`, `--paper`, `--surface`, `--placeholder`, `--text`,
    `--text-2`, `--text-3`, `--line`, `--line-mid`, `--line-strong`, `--overlay`), tipografía
    (`--font-display` Bodoni Moda, `--font-ui` Archivo), forma (`--radius: 0`) y movimiento
    (`--dur-fast`, `--dur`, `--dur-slow`, `--ease-out`, `--transition`).
  - Bloque `LEGACY` con las variables viejas apuntando a las nuevas, tal cual el brief.
  - Se sacó el `@import` de Google Fonts (Playfair / Cormorant / EB Garamond).
  - `body`: fondo `--paper`, color `--text`, `--font-ui`, 16px, line-height 1.6.
  - Se eliminó el overlay de grano (`body::before`).
  - Globales nuevos: `::selection`, `:focus-visible` y bloque `prefers-reduced-motion: reduce`.
- `index.html`: preconnect a `fonts.googleapis.com` y `fonts.gstatic.com` (crossorigin), `<link>` a
  Archivo + Bodoni Moda, favicon `/feria_logo_mark.png` (`image/png`) y `theme-color` `#FFFFFF`.
- Logo: `Header.tsx`, `Hero.tsx` y `Footer.tsx` importan `src/assets/feria_logo.png`.
- Se borraron `src/assets/feria_logo.jpeg` y `public/feria_logo.jpeg` (ya no los referencia nada).

## Archivos creados y modificados
Creados:
- `docs/avances/04-restyling-base.md`

Modificados:
- `src/styles/global.css`
- `index.html`
- `src/components/Header.tsx`
- `src/components/Hero.tsx`
- `src/components/Footer.tsx`

Borrados:
- `src/assets/feria_logo.jpeg`
- `public/feria_logo.jpeg`

## Decisiones tomadas durante la implementación
- El `button` global usaba `font-family: var(--font-body)`; se pasó a `var(--font-ui)` (mismo
  resultado vía alias, pero ya con el nombre nuevo porque está en `global.css`).
- `prefers-reduced-motion`: se usa `0.01ms !important` para animaciones y transiciones (en vez de `0`,
  así siguen disparando los eventos `animationend`/`transitionend`) y `scroll-behavior: auto` tanto
  en `html` como en `*`, para pisar el `smooth` de `html`.
- Se mantuvo `html { scroll-behavior: smooth; }` fuera del media query: el reduced-motion lo pisa.

## Desvíos respecto al brief
Ninguno.

## Pendientes o problemas encontrados
- `src/assets/feria_logo.png` y `public/feria_logo_mark.png` todavía no están en git (untracked):
  hay que sumarlos al commit o el build en Vercel falla.

Revisión hecha leyendo los CSS contra los valores nuevos (no con capturas). Conviene confirmarlo
en el navegador.

### Lugares donde los aliases dan un resultado feo o raro

**Header (brief 05)** — fondo `--black` → negro
- `.header`: `border-bottom: var(--gold-dark)` → `--ink`, negro sobre negro: el borde desaparece.
- `.header__logo-img`: el borde `--gold-dark` es invisible. El logo se ve bien porque tiene
  `filter: brightness(0) invert(1)` (queda blanco).
- `.header__tagline`: `--gold` → `#5C5C5C` sobre negro, contraste bajo (~3:1).
- `.header__cart-btn:hover`: texto y borde pasan a `#5C5C5C` sobre negro (pierde contraste en vez de
  ganarlo) y el fondo sigue con `rgba(184, 148, 90, 0.08)` hardcodeado (tinte dorado).
- `.header__cart-badge`: gris `#5C5C5C` con texto negro, casi ilegible.

**Hero (brief 06)** — fondo negro
- `.hero__logo`: tiene `filter: none` al final del archivo → logo negro sobre fondo negro, **invisible**.
- `.hero__texture`: el gradiente radial dorado `rgba(184, 148, 90, 0.08)` está hardcodeado, sigue
  dando un tinte cálido.
- `.hero::before` / `.hero::after` (marcos de esquina): borde `--gold-dark` → negro sobre negro,
  invisibles.
- `.hero__eyebrow` y `.hero__cta` (texto y borde): `#5C5C5C` sobre negro, contraste bajo.
- `.hero__cta:hover`: fondo gris `#5C5C5C` con texto negro, poco legible.
- `.hero__scroll-hint`: `--gold-dark` → negro sobre negro, **invisible**.
- `.hero__copy`: itálica sobre Archivo (ver nota de itálicas).

**Catálogo y cards (brief 07)**
- `.catalog__divider::after`: el gradiente dorado ahora es negro, se ve más duro que antes.
- `.product-card`: sombras (`--shadow`) y borde redondeado chico; la dirección pide sin sombras.
- `.product-card__img-wrap` y `.size-label`: fondo `--cream` → blanco, igual que la card; los talles
  quedan sin fondo diferenciado (solo el borde).
- `.product-card__condition`: los colores vienen de `conditionColors` en `ProductCard.tsx`
  (`#5a7a4a`, `#7a6a3a`, `#5a5a7a`): siguen siendo verde/oliva/violáceo, rompen el blanco y negro.
- `.add-btn--added`: `--gold-dark` → negro, igual que `.add-btn` normal: **no hay feedback visual**
  de "agregado".
- `.add-btn--disabled`: texto `#5C5C5C` sobre `#2E2E2E`, contraste muy bajo (~2:1).
- `.skeleton`: el shimmer va de `#E6E6E3` a `#E2E2DF`, casi no se nota el movimiento.

**Detalle de producto (brief 08)**
- `.detail`: fondo `--cream` → blanco; `.detail__main-img-wrap` también blanco, la foto no tiene
  marco/fondo diferenciado.
- `.detail__condition`: mismos colores hardcodeados que la card (`ProductDetail.tsx`).
- `.detail__thumb--active` (`#5C5C5C`) vs `.detail__thumb:hover` (negro): el hover marca más fuerte
  que el activo, raro.
- `.detail__add-btn--added`: igual que en cards, sin diferencia con el estado normal.
- `.detail__add-btn--disabled`: mismo bajo contraste que en cards.

**Carrito (brief 09)**
- `.cart` y `.cart__footer`: ambos blancos, el footer del carrito ya no se separa del listado.
- `.cart__close:hover`: pasa a `#5C5C5C` sobre negro, pierde contraste.
- `.cart-overlay`: usa `rgba(14, 12, 10, 0.6)` hardcodeado (reemplazar por `--overlay`).
- `.cart__order-btn`: sigue verde WhatsApp (pendiente de decidir en su brief, como dice la dirección).
- `.qty-control button`: fondo blanco, hover `#E6E6E3`; queda bien pero muy plano.

**Historia / About (brief 10)** — fondo negro
- `.about::before`: gradiente dorado hardcodeado `rgba(184, 148, 90, 0.06)`.
- `.about__divider::after`: gradiente `--gold-dark` → negro sobre negro, invisible.
- `.about__lead` (itálica) y `.about__stat-number`: `#5C5C5C` sobre negro, contraste bajo para
  textos destacados.
- `.about__stat-label`: `--text-muted` `#5C5C5C` sobre negro, contraste bajo.

**Contacto (brief 10)**
- `.contact` y `.contact__card`: ambos blancos, las cards solo se separan por borde/sombra.
- `.contact__wa-btn`: verde WhatsApp (pendiente de su brief).

**Footer (brief 10)** — fondo negro
- `.footer__logo`: el PNG es negro y el footer es negro → logo **invisible** (además con opacity 0.7).
- `.footer__dev` (link "Diseñado y desarrollado por…"): `--gold-dark` → negro sobre negro, **invisible**.
- `.footer`: `border-top` `--gold-dark` invisible.
- `.footer__ornament` y `.footer__copy`: `#5C5C5C` sobre negro, contraste bajo.

**Global / transversal**
- Itálicas: muchos textos usan `font-style: italic` con `--font-body`/`--font-alt` (ahora Archivo).
  El link de Google Fonts solo carga Archivo romana, así que el navegador sintetiza una itálica falsa.
  Revisar en cada brief si se quitan las itálicas o se pasan a Bodoni Moda itálica.
- `letter-spacing` amplios (0.1em–0.5em) estaban pensados para serif; en Archivo se ven muy abiertos.
- Pesos 300 que había para Cormorant ahora caen a 400 (Archivo carga 400–800).

**Admin** (no se toca, pero para tener en cuenta)
- Se lee bien. `.admin-bar`, `.admin-modal__panel` y `.admin-modal__footer` pasan de crema a blanco
  y se separan menos del fondo. `.admin-switch__track` apagado queda `#E6E6E3` sobre blanco, poco
  visible. `.admin-input:focus` usa outline gris `#5C5C5C`.

## Cómo probarlo
1. `git checkout restyling && npm install && npm run dev`.
2. `npm run build` → debe pasar (pasó al cerrar este brief).
3. DevTools → Network → filtro "Font": solo Archivo y Bodoni Moda (`fonts.gstatic.com`).
4. Buscar "Playfair", "Cormorant" y "EB Garamond" en `src/` e `index.html`: sin resultados.
5. Ver que no hay grano sobre la página.
6. Recorrer catálogo, detalle, carrito y contacto: todo en blanco y negro y legible.
7. Hero y Footer: esperable que el logo (y el link del footer) no se vean, ver Pendientes.
8. `/admin`: login, lista, switch y galería funcionan.
9. Pestaña del navegador: el favicon es el círculo FA.
