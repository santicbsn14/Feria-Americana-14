export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__img skeleton" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__title skeleton" />
        <div className="skeleton-card__desc skeleton" />
        <div className="skeleton-card__desc-short skeleton" />
        <div className="skeleton-card__size skeleton" />
        <div className="skeleton-card__footer">
          <div className="skeleton-card__price skeleton" />
          <div className="skeleton-card__btn skeleton" />
        </div>
      </div>
    </div>
  )
}