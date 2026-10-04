import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { getProducts } from '../lib/queries'
import { isSectionScrollActive, onSectionScrollEnd, scrollToSection } from '../lib/sectionScroll'
import type { Category, Product } from '../types'
import ProductCard from './ProductCard'
import SkeletonCard from './SkeletonCard'

const ALL = 'Todos'
const PAGE_SIZE = 8

const categories: Category[] = [
  'Ropa Mujer',
  'Ropa Hombre',
  'Ropa Niños',
  'Calzado',
  'Accesorios',
  'Hogar',
]

export default function ProductGrid() {
  const [active, setActive] = useState<string>(ALL)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  // true después del primer cambio de categoría: la grilla entra con fundido y sin reveal
  const [switched, setSwitched] = useState(false)
  const catalogRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const available = useMemo(() => products.filter((p) => p.available), [products])

  const filters = useMemo(() => {
    const counts = new Map<string, number>()
    available.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1))
    return [
      { name: ALL, count: available.length },
      ...categories
        .map((name) => ({ name, count: counts.get(name) ?? 0 }))
        .filter((f) => f.count > 0),
    ]
  }, [available])

  const filtered = active === ALL ? available : available.filter((p) => p.category === active)

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  const selectCategory = (cat: string) => {
    if (cat === active) return
    const catalogTop = catalogRef.current?.getBoundingClientRect().top ?? 0
    setActive(cat)
    setPage(1)
    setSwitched(true)
    // Si el comienzo del catálogo quedó arriba del viewport, volver a los filtros
    const filtersEl = filtersRef.current
    if (catalogTop < 0 && filtersEl) {
      requestAnimationFrame(() => scrollToSection(filtersEl))
    }
  }

  // Infinite scroll. Se ignora el sentinel durante un scroll programático a una sección
  // (si no, al pasar por el catálogo rumbo a #contacto se cargan más productos y la página crece).
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return

    let intersecting = false
    const observer = new IntersectionObserver(
      (entries) => {
        intersecting = entries[0].isIntersecting
        if (intersecting && !isSectionScrollActive()) {
          loadMore()
        }
      },
      { rootMargin: '0px 0px 300px 0px' }
    )
    // Si el scroll programático terminó con el sentinel a la vista, cargar ahora
    const unsubscribe = onSectionScrollEnd(() => {
      if (intersecting) loadMore()
    })

    observer.observe(loaderRef.current)
    return () => {
      observer.disconnect()
      unsubscribe()
    }
  }, [hasMore, loadMore])

  return (
    <section className="catalog">
      <div className="catalog__inner" ref={catalogRef}>
        <header className="catalog__head">
          <div>
            <p className="catalog__eyebrow">Stock actual</p>
            <h2 className="catalog__title">Catálogo</h2>
          </div>
          <p className="catalog__note">Cada prenda es única. Cuando se vende, desaparece.</p>
        </header>

        <div
          className="catalog__filters"
          ref={filtersRef}
          role="group"
          aria-label="Filtrar por categoría"
        >
          {(loading ? [{ name: ALL, count: null }] : filters).map(({ name, count }) => (
            <button
              key={name}
              type="button"
              className={`catalog__filter ${active === name ? 'catalog__filter--active' : ''}`}
              aria-pressed={active === name}
              onClick={() => selectCategory(name)}
            >
              {name}
              {count !== null && <span className="catalog__filter-count">{count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="product-grid" aria-busy="true">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="catalog__empty">No hay prendas en esta categoría por ahora.</p>
        ) : (
          <>
            <div
              key={active}
              className={`product-grid ${switched ? 'product-grid--enter' : ''}`}
            >
              {visible.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  revealed={switched && i < PAGE_SIZE}
                />
              ))}
            </div>

            {hasMore && <div ref={loaderRef} className="catalog__sentinel" aria-hidden="true" />}
          </>
        )}
      </div>
    </section>
  )
}
