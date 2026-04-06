import { useState, useEffect } from 'react'
import { getProducts } from '../lib/queries'
import type { Product } from '../types'
import ProductCard from './ProductCard'

const ALL = 'Todos'

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

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const filtered =
    active === ALL
      ? products.filter((p) => p.available)
      : products.filter((p) => p.available && p.category === active)

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
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}