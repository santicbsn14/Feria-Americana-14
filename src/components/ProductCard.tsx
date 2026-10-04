import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { imgCrop } from '../lib/sanityClient'
import { useReveal } from '../hooks/useReveal'

interface Props {
  product: Product
  /** Mostrar sin animación de entrada (la grilla ya entra con su propio fundido). */
  revealed?: boolean
}

const conditionModifier: Record<Product['condition'], string> = {
  Excelente: 'excelente',
  'Muy bueno': 'muy-bueno',
  Bueno: 'bueno',
}

// 4 columnas desde 1100px, 3 desde 768px, 2 en mobile
const SIZES = '(min-width: 1100px) 290px, (min-width: 768px) 31vw, 48vw'

const srcSet = (url: string) => `${imgCrop(url, 400, 500)} 400w, ${imgCrop(url, 800, 1000)} 800w`

export default function ProductCard({ product, revealed: initialRevealed = false }: Props) {
  const { addItem, removeItem, isInCart } = useCart()
  const inCart = isInCart(product.id)
  const [cardRef, revealed] = useReveal<HTMLElement>(initialRevealed)
  const [loaded, setLoaded] = useState(false)
  const [altMounted, setAltMounted] = useState(false)
  const [altLoaded, setAltLoaded] = useState(false)

  const altImage = product.gallery?.[0]
  const href = `/producto/${product.id}`

  // Imágenes que ya vienen de caché pueden estar completas antes de que React escuche onLoad
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])
  const altRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setAltLoaded(true)
  }, [])

  // La segunda foto se descarga recién al primer hover, y solo en dispositivos con hover
  const handleMouseEnter = () => {
    if (altImage && !altMounted && window.matchMedia('(hover: hover)').matches) {
      setAltMounted(true)
    }
  }

  const handleToggle = () => {
    if (!product.available) return
    if (inCart) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  const classes = [
    'product-card',
    !revealed && 'product-card--pending',
    !altImage && 'product-card--zoom',
    !product.available && 'product-card--sold',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article ref={cardRef} className={classes} onMouseEnter={handleMouseEnter}>
      <Link
        to={href}
        className="product-card__media"
        tabIndex={-1}
        style={product.lqip ? { backgroundImage: `url(${product.lqip})` } : undefined}
      >
        <img
          ref={imgRef}
          src={imgCrop(product.image, 400, 500)}
          srcSet={srcSet(product.image)}
          sizes={SIZES}
          alt={product.name}
          width={400}
          height={500}
          loading="lazy"
          decoding="async"
          className={`product-card__img ${loaded ? 'product-card__img--loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        {altImage && altMounted && (
          <img
            ref={altRef}
            src={imgCrop(altImage, 400, 500)}
            srcSet={srcSet(altImage)}
            sizes={SIZES}
            alt=""
            width={400}
            height={500}
            decoding="async"
            className={`product-card__img product-card__img--alt ${altLoaded ? 'product-card__img--loaded' : ''}`}
            onLoad={() => setAltLoaded(true)}
          />
        )}
        <span
          className={`product-card__badge product-card__badge--${conditionModifier[product.condition]}`}
        >
          {product.condition}
        </span>
        {!product.available && (
          <span className="product-card__sold">
            <span className="product-card__sold-band">Vendido</span>
          </span>
        )}
      </Link>

      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">
          <Link to={href}>{product.name}</Link>
        </h3>
        <div className="product-card__meta">
          <span className="product-card__size">{product.size && `Talle ${product.size}`}</span>
          <span className="product-card__price">${product.price.toLocaleString('es-AR')}</span>
        </div>
        <button
          type="button"
          className={`product-card__btn ${inCart ? 'product-card__btn--added' : ''}`}
          onClick={handleToggle}
          disabled={!product.available}
        >
          {!product.available ? (
            'Vendido'
          ) : inCart ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              En el carrito
            </>
          ) : (
            'Agregar al carrito'
          )}
        </button>
      </div>
    </article>
  )
}
