// Scroll programático a una sección (#catalogo, #historia, #contacto o los filtros del catálogo).
// Mientras dura, el infinite scroll del catálogo ignora su sentinel. Cuando el scroll se detiene,
// si la sección quedó corrida (la página cambió de alto en el camino), se corrige la posición.
// Si el usuario scrollea a mano (rueda, touch, teclado), se cancela la corrección.

const IDLE_MS = 180
const MAX_CORRECTIONS = 2

let active = false
let cancelCurrent: (() => void) | null = null
const endListeners = new Set<() => void>()

export function isSectionScrollActive() {
  return active
}

/** Avisa cuando termina un scroll programático. Devuelve la función para desuscribirse. */
export function onSectionScrollEnd(listener: () => void) {
  endListeners.add(listener)
  return () => {
    endListeners.delete(listener)
  }
}

export function scrollToSection(el: HTMLElement) {
  cancelCurrent?.()

  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
  let timer = 0
  let corrections = 0

  const arm = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(onIdle, IDLE_MS)
  }

  const finish = () => {
    window.clearTimeout(timer)
    window.removeEventListener('scroll', arm)
    window.removeEventListener('wheel', finish)
    window.removeEventListener('touchstart', finish)
    window.removeEventListener('keydown', finish)
    active = false
    cancelCurrent = null
    endListeners.forEach((listener) => listener())
  }

  function onIdle() {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    const off = Math.abs(el.getBoundingClientRect().top - margin) > 2
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    if (off && !atBottom && corrections < MAX_CORRECTIONS) {
      corrections++
      el.scrollIntoView({ behavior })
      arm()
    } else {
      finish()
    }
  }

  active = true
  cancelCurrent = finish
  window.addEventListener('scroll', arm, { passive: true })
  window.addEventListener('wheel', finish, { passive: true })
  window.addEventListener('touchstart', finish, { passive: true })
  window.addEventListener('keydown', finish)
  el.scrollIntoView({ behavior })
  arm()
}
