import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getProduct, getRelatedProducts } from '../lib/queries'
import { useCart } from '../context/CartContext'
import { imgCrop, imgUrl } from '../lib/sanityClient'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { WHATSAPP_NUMBER } from '../data/products'
import ProductCard from './ProductCard'
import { CheckIcon, WhatsAppIcon } from './Icons'
import type { Product } from '../types'

const DESKTOP = '(min-width: 900px)'

// Galería: ~58% de 1280px en desktop, ancho completo en mobile
const MAIN_SIZES = '(min-width: 1280px) 700px, (min-width: 900px) 56vw, 100vw'

const conditionModifier: Record<Product['condition'], string> = {
  Excelente: 'excelente',
  'Muy bueno': 'muy-bueno',
  Bueno: 'bueno',
}

const mainSrcSet = (url: string) => `${imgUrl(url, 800)} 800w, ${imgUrl(url, 1200)} 1200w`

// Remonta todo al cambiar de id: se resetean la foto activa, el carrusel y los datos.
export default function ProductDetail() {
  const { id = '' } = useParams()
  return <ProductDetailView key={id} id={id} />
}

function ProductDetailView({ id }: { id: string }) {
  // undefined = cargando, null = no encontrado
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [related, setRelated] = useState<Product[]>([])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    let cancelled = false
    getProduct(id).then((found) => {
      if (cancelled) return
      setProduct(found)
      if (!found) return
      getRelatedProducts(found.category, found.id).then((items) => {
        if (!cancelled) setRelated(items)
      })
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (product === null) {
    return (
      <div className="detail">
        <div className="detail__inner detail__not-found">
          <p className="detail__not-found-title">No encontramos esta prenda.</p>
          <p className="detail__not-found-text">Puede que el link esté mal o que ya no esté publicada.</p>
          <Link to={{ pathname: '/', hash: '#catalogo' }} className="detail__cta detail__cta--inline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="detail">
      <div className="detail__inner">
        <BackLink />
        {product === undefined ? (
          <DetailSkeleton />
        ) : (
          <div className="detail__layout">
            <Gallery product={product} />
            <Info product={product} />
          </div>
        )}
      </div>

      {product && related.length > 0 && (
        <section className="detail-related" aria-labelledby="detail-related-title">
          <div className="detail-related__inner">
            <h2 id="detail-related-title" className="detail-related__title">
              Más de {product.category}
            </h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/* ===== Volver ===== */
function BackLink() {
  const navigate = useNavigate()
  const { key } = useLocation()
  // "default" es la primera entrada del historial: se llegó directo por link
  const cameFromSite = key !== 'default'

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (cameFromSite) navigate(-1)
    else navigate({ pathname: '/', hash: '#catalogo' })
  }

  return (
    <a href="/#catalogo" className="detail__back" onClick={handleClick}>
      <span aria-hidden="true">←</span> Volver al catálogo
    </a>
  )
}

/* ===== Galería ===== */

// Índices de las fotos ya cargadas. markLoaded es estable (sirve para refs de imágenes en caché).
function useLoadedSet() {
  const [loaded, setLoaded] = useState<number[]>([])
  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => (prev.includes(i) ? prev : [...prev, i]))
  }, [])
  return [loaded, markLoaded] as const
}

interface GalleryImageProps {
  index: number
  src: string
  alt: string
  visible: boolean
  lazy?: boolean
  onLoaded: (index: number) => void
}

function GalleryImage({ index, src, alt, visible, lazy, onLoaded }: GalleryImageProps) {
  // Imágenes que ya vienen de caché pueden estar completas antes de que React escuche onLoad
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) onLoaded(index)
    },
    [index, onLoaded]
  )

  return (
    <img
      ref={ref}
      src={imgUrl(src, 800)}
      srcSet={mainSrcSet(src)}
      sizes={MAIN_SIZES}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      className={`detail-gallery__img ${visible ? 'detail-gallery__img--visible' : ''}`}
      onLoad={() => onLoaded(index)}
      onError={() => onLoaded(index)}
    />
  )
}

function SoldOverlay() {
  return (
    <span className="detail-gallery__sold">
      <span className="detail-gallery__sold-band">Vendido</span>
    </span>
  )
}

function Gallery({ product }: { product: Product }) {
  const desktop = useMediaQuery(DESKTOP)
  const images = [product.image, ...(product.gallery ?? [])].filter(Boolean)
  return desktop ? (
    <DesktopGallery product={product} images={images} />
  ) : (
    <MobileGallery product={product} images={images} />
  )
}

interface GalleryProps {
  product: Product
  images: string[]
}

const photoAlt = (name: string, i: number, total: number) =>
  i === 0 ? name : `${name}, foto ${i + 1} de ${total}`

function DesktopGallery({ product, images }: GalleryProps) {
  const [active, setActive] = useState(0)
  // La foto que se ve: cambia recién cuando la nueva terminó de cargar (fundido sin hueco)
  const [shown, setShown] = useState(0)
  const [mounted, setMounted] = useState<number[]>([0])
  const [loaded, markLoaded] = useLoadedSet()
  const activeRef = useRef(0)

  const handleLoaded = useCallback(
    (i: number) => {
      markLoaded(i)
      if (i === activeRef.current) setShown(i)
    },
    [markLoaded]
  )

  const mount = (i: number) => setMounted((prev) => (prev.includes(i) ? prev : [...prev, i]))

  const select = (i: number) => {
    activeRef.current = i
    setActive(i)
    mount(i)
    if (loaded.includes(i)) setShown(i)
  }

  return (
    <div className="detail-gallery">
      <div
        className="detail-gallery__frame"
        // El lqip tiene la proporción de la foto principal: se quita cuando ya cargó
        style={product.lqip && !loaded.includes(0) ? { backgroundImage: `url(${product.lqip})` } : undefined}
      >
        {mounted.map((i) => (
          <GalleryImage
            key={i}
            index={i}
            src={images[i]}
            alt={i === shown ? photoAlt(product.name, i, images.length) : ''}
            visible={i === shown && loaded.includes(i)}
            onLoaded={handleLoaded}
          />
        ))}
        {!product.available && <SoldOverlay />}
      </div>

      {images.length > 1 && (
        <div className="detail-gallery__thumbs" role="group" aria-label="Fotos de la prenda">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              className={`detail-gallery__thumb ${i === active ? 'detail-gallery__thumb--active' : ''}`}
              aria-label={`Ver foto ${i + 1} de ${images.length}`}
              aria-pressed={i === active}
              onClick={() => select(i)}
              // Precarga la foto grande al pasar el mouse
              onMouseEnter={() => mount(i)}
            >
              <img src={imgCrop(url, 144, 180)} alt="" width={72} height={90} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MobileGallery({ product, images }: GalleryProps) {
  const [index, setIndex] = useState(0)
  const [loaded, markLoaded] = useLoadedSet()
  const trackRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div className="detail-gallery">
      <div
        ref={trackRef}
        className="detail-gallery__track"
        onScroll={handleScroll}
        role={images.length > 1 ? 'region' : undefined}
        aria-label={images.length > 1 ? 'Fotos de la prenda (deslizá para ver más)' : undefined}
        tabIndex={images.length > 1 ? 0 : undefined}
      >
        {images.map((url, i) => (
          <div
            key={url + i}
            className="detail-gallery__slide"
            style={i === 0 && product.lqip && !loaded.includes(0) ? { backgroundImage: `url(${product.lqip})` } : undefined}
          >
            <GalleryImage
              index={i}
              src={url}
              alt={photoAlt(product.name, i, images.length)}
              visible={loaded.includes(i)}
              lazy={i > 0}
              onLoaded={markLoaded}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <span className="detail-gallery__counter" aria-hidden="true">
          {index + 1} / {images.length}
        </span>
      )}
      {!product.available && <SoldOverlay />}
    </div>
  )
}

/* ===== Info ===== */
function Info({ product }: { product: Product }) {
  const { addItem, removeItem, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const handleToggle = () => {
    if (!product.available) return
    if (inCart) removeItem(product.id)
    else addItem(product)
  }

  const size = product.size ? ` — Talle ${product.size}` : ''
  const consultText = `¡Hola! Quería consultar por esta prenda: ${product.name}${size} — ${window.location.href}`
  const consultUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(consultText)}`

  return (
    <div className="detail__info">
      <p className="detail__category">{product.category}</p>
      <h1 className="detail__name">{product.name}</h1>
      <p className="detail__price">${product.price.toLocaleString('es-AR')}</p>

      <div className="detail__tags">
        <span className={`detail__badge detail__badge--${conditionModifier[product.condition]}`}>
          {product.condition}
        </span>
        {product.size && <span className="detail__size">Talle {product.size}</span>}
      </div>

      {product.description && <p className="detail__desc">{product.description}</p>}

      <div className="detail__actions">
        <button
          type="button"
          className={`detail__cta ${inCart ? 'detail__cta--added' : ''}`}
          onClick={handleToggle}
          disabled={!product.available}
        >
          {!product.available ? (
            'Vendido'
          ) : inCart ? (
            <>
              <CheckIcon />
              En tu pedido
            </>
          ) : (
            'Agregar al pedido'
          )}
        </button>

        <a className="detail__consult" href={consultUrl} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={18} />
          Consultar por esta prenda
        </a>
      </div>

      <ul className="detail__notes">
        <li>Prenda única: hay una sola unidad.</li>
        <li>El pedido se coordina por WhatsApp.</li>
      </ul>
    </div>
  )
}

/* ===== Skeleton (misma estructura que el detalle) ===== */
function DetailSkeleton() {
  return (
    <div className="detail__layout" aria-busy="true" aria-label="Cargando prenda">
      <div className="detail-gallery" aria-hidden="true">
        <div className="detail-gallery__frame skeleton" />
      </div>
      <div className="detail__info detail-skeleton" aria-hidden="true">
        <span className="detail-skeleton__bar detail-skeleton__bar--category skeleton" />
        <span className="detail-skeleton__bar detail-skeleton__bar--title skeleton" />
        <span className="detail-skeleton__bar detail-skeleton__bar--title-short skeleton" />
        <span className="detail-skeleton__bar detail-skeleton__bar--price skeleton" />
        <span className="detail-skeleton__bar detail-skeleton__bar--tags skeleton" />
        <div className="detail-skeleton__desc">
          <span className="detail-skeleton__bar skeleton" />
          <span className="detail-skeleton__bar skeleton" />
          <span className="detail-skeleton__bar detail-skeleton__bar--short skeleton" />
        </div>
        <span className="detail-skeleton__cta skeleton" />
        <span className="detail-skeleton__cta detail-skeleton__cta--ghost skeleton" />
      </div>
    </div>
  )
}
