// Usa los mismos contenedores que ProductCard para tener exactamente sus dimensiones.
export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="product-card__media skeleton" />
      <div className="product-card__body">
        <div className="product-card__category">
          <span className="skeleton-card__bar skeleton skeleton-card__bar--category" />
        </div>
        <div className="product-card__name">
          <span className="skeleton-card__bar skeleton skeleton-card__bar--name" />
          <span className="skeleton-card__bar skeleton skeleton-card__bar--name-short" />
        </div>
        <div className="product-card__meta">
          <span className="skeleton-card__bar skeleton skeleton-card__bar--size" />
          <span className="skeleton-card__bar skeleton skeleton-card__bar--price" />
        </div>
        <div className="product-card__btn skeleton-card__btn skeleton" />
      </div>
    </div>
  )
}
