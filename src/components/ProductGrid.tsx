import { useState, useEffect, useRef, useCallback } from 'react'
import { getProducts } from '../lib/queries'
import type { Product } from '../types'
import ProductCard from './ProductCard'

const ALL = 'Todos'
const PAGE_SIZE = 8

const categories = [
  ALL,
  'Ropa Mujer',
  'Ropa Hombre',
  'Ropa Niños',
  'Calzado',
  'Accesorios',
  'Hogar',
] as const

export default function ProductGrid() {
  const [active, setActive] = useState<string>(ALL)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  // Resetear página al cambiar categoría
  useEffect(() => {
    setPage(1)
  }, [active])

  const filtered = (
    active === ALL
      ? products.filter((p) => p.available)
      : products.filter((p) => p.available && p.category === active)
  )

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <section className="catalog">
      <div className="catalog__header">
        <div className="catalog__divider">
          <span className="catalog__divider-ornament">✦</span>
        </div>
        <h2 className="catalog__title">Catálogo</h2>
        <p className="catalog__subtitle">Piezas únicas seleccionadas con amor</p>
      </div>

      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${active === cat ? 'filter-btn--active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="catalog__loading">
          <span>Cargando productos...</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="catalog__empty">No hay productos en esta categoría por el momento.</p>
      ) : (
        <>
          <div className="product-grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div ref={loaderRef} className="catalog__infinite-loader">
              <span>Cargando más productos...</span>
            </div>
          )}
        </>
      )}
    </section>
  )
}