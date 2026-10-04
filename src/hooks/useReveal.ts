import { useEffect, useRef, useState } from 'react'

const shouldSkip = () =>
  typeof IntersectionObserver === 'undefined' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Devuelve [ref, revealed]: revealed pasa a true la primera vez que el elemento entra al
 * viewport y después deja de observar. Con reducir movimiento arranca revelado.
 * `initial = true` lo muestra de entrada (por ejemplo, si ya entra con otra animación).
 */
export function useReveal<T extends Element>(initial = false) {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(() => initial || shouldSkip())

  useEffect(() => {
    const el = ref.current
    if (revealed || !el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [revealed])

  return [ref, revealed] as const
}
