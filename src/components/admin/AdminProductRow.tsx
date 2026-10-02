import { imgUrl } from '../../lib/sanityClient'
import type { AdminProduct } from '../../lib/queries'

interface AdminProductRowProps {
  product: AdminProduct
  pending: boolean
  onToggle: (product: AdminProduct) => void
  onOpenGallery: (product: AdminProduct) => void
}

export default function AdminProductRow({ product, pending, onToggle, onOpenGallery }: AdminProductRowProps) {
  const { name, price, image, category, available, gallery } = product

  return (
    <li className={`admin-row ${available ? '' : 'admin-row--sold'}`}>
      {image ? (
        <img className="admin-row__thumb" src={imgUrl(image, 120)} alt="" loading="lazy" width={56} height={56} />
      ) : (
        <div className="admin-row__thumb admin-row__thumb--empty" aria-hidden="true" />
      )}

      <div className="admin-row__info">
        <p className="admin-row__name">{name || 'Sin nombre'}</p>
        <p className="admin-row__meta">
          {typeof price === 'number' ? `$${price.toLocaleString('es-AR')}` : 'Sin precio'}
          {category && <> · {category}</>}
        </p>
        <button type="button" className="admin-row__photos" onClick={() => onOpenGallery(product)}>
          Fotos ({gallery?.length ?? 0})
        </button>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={available}
        aria-label={`${name}: ${available ? 'disponible' : 'vendido'}`}
        className={`admin-switch ${available ? 'admin-switch--on' : ''}`}
        disabled={pending}
        onClick={() => onToggle(product)}
      >
        <span className="admin-switch__track" aria-hidden="true">
          <span className="admin-switch__thumb" />
        </span>
        <span className="admin-switch__label">{available ? 'Disponible' : 'Vendido'}</span>
      </button>
    </li>
  )
}
