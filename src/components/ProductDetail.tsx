import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducts } from '../lib/queries'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

const conditionColors: Record<string, string> = {
  Excelente: '#5a7a4a',
  'Muy bueno': '#7a6a3a',
  Bueno: '#5a5a7a',
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, removeItem, isInCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    getProducts().then((products) => {
      const found = products.find((p) => p.id === id)
      setProduct(found ?? null)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (loading) {
    return (
      <div className="detail-loading">
        <span>Cargando producto...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="detail-loading">
        <span>Producto no encontrado</span>
        <button onClick={() => navigate('/')}>Volver al catálogo</button>
      </div>
    )
  }

  const inCart = isInCart(product.id)
  const allImages = [product.image, ...(product.gallery ?? [])].filter(Boolean)

  const handleToggle = () => {
    if (!product.available) return
    if (inCart) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  return (
    <div className="detail">
      <div className="detail__inner">
        <button className="detail__back" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="detail__layout">
          {/* Galería */}
          <div className="detail__gallery">
            <div className="detail__main-img-wrap">
              <img
                src={allImages[activeImg]}
                alt={product.name}
                className="detail__main-img"
              />
              {!product.available && (
                <div className="detail__sold-overlay">
                  <span>VENDIDO</span>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="detail__thumbnails">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`detail__thumb ${activeImg === i ? 'detail__thumb--active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${product.name} foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail__info">
            <span className="detail__category">{product.category}</span>
            <h1 className="detail__name">{product.name}</h1>

            <div className="detail__badges">
              <span
                className="detail__condition"
                style={{ backgroundColor: conditionColors[product.condition] }}
              >
                {product.condition}
              </span>
              {product.size && (
                <span className="detail__size">Talle {product.size}</span>
              )}
            </div>

            <p className="detail__desc">{product.description}</p>

            <div className="detail__price">
              ${product.price.toLocaleString('es-AR')}
            </div>

            <button
              className={`detail__add-btn ${inCart ? 'detail__add-btn--added' : ''} ${!product.available ? 'detail__add-btn--disabled' : ''}`}
              onClick={handleToggle}
              disabled={!product.available}
            >
              {!product.available ? 'Vendido' : inCart ? '✓ Ya está en tu pedido' : 'Agregar al pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}