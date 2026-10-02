import { useEffect, useRef, useState } from 'react'
import { imgUrl } from '../../lib/sanityClient'
import { addGalleryImage, removeGalleryImage, UnauthorizedError } from '../../lib/adminApi'
import type { AdminGalleryImage, AdminProduct } from '../../lib/queries'

interface AdminGalleryProps {
  product: AdminProduct
  password: string
  onClose: () => void
  onGalleryChange: (gallery: AdminGalleryImage[]) => void
  onUnauthorized: () => void
}

export default function AdminGallery({ product, password, onClose, onGalleryChange, onUnauthorized }: AdminGalleryProps) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [confirmKey, setConfirmKey] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const gallery = product.gallery ?? []

  // Bloquear el scroll de la página de fondo y enfocar el botón de cerrar al abrir.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onClose])

  async function handleFiles(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : []
    if (inputRef.current) inputRef.current.value = '' // permite volver a elegir la misma foto
    if (files.length === 0) return

    setBusy(true)
    setErrors([])
    setConfirmKey(null)
    const failed: string[] = []

    for (const [i, file] of files.entries()) {
      setProgress(files.length > 1 ? `Subiendo ${i + 1} de ${files.length}…` : 'Subiendo foto…')
      try {
        onGalleryChange(await addGalleryImage(product.id, file, password))
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          onUnauthorized()
          return
        }
        failed.push(`${file.name || `Foto ${i + 1}`}: ${(err as Error).message}`)
        setErrors([...failed])
      }
    }

    setProgress(null)
    setBusy(false)
  }

  async function handleRemove(key: string) {
    setBusy(true)
    setErrors([])
    setProgress('Borrando foto…')
    try {
      onGalleryChange(await removeGalleryImage(product.id, key, password))
      setConfirmKey(null)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        onUnauthorized()
        return
      }
      setErrors([`No se pudo borrar la foto: ${(err as Error).message}`])
    }
    setProgress(null)
    setBusy(false)
  }

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-gallery-title">
      <div className="admin-modal__panel">
        <header className="admin-modal__header">
          <div className="admin-modal__heading">
            <h2 id="admin-gallery-title" className="admin-modal__title">
              Fotos
            </h2>
            <p className="admin-modal__subtitle">{product.name}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="admin-modal__close"
            aria-label="Cerrar"
            disabled={busy}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="admin-modal__body">
          {product.image && (
            <figure className="admin-gallery__main">
              <img src={imgUrl(product.image, 400)} alt="" />
              <figcaption className="admin-gallery__badge">Principal</figcaption>
            </figure>
          )}

          <h3 className="admin-gallery__heading">Galería ({gallery.length})</h3>

          {gallery.length === 0 ? (
            <p className="admin-gallery__empty">Todavía no hay fotos en la galería.</p>
          ) : (
            <ul className="admin-gallery__grid">
              {gallery.map((item, i) => (
                <li key={item.key} className="admin-gallery__item">
                  {item.url ? (
                    <img src={imgUrl(item.url, 200)} alt={`Foto ${i + 1}`} loading="lazy" />
                  ) : (
                    <div className="admin-gallery__placeholder">Sin imagen</div>
                  )}

                  {confirmKey === item.key ? (
                    <div className="admin-gallery__confirm">
                      <p>¿Borrar esta foto?</p>
                      <div className="admin-gallery__confirm-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          disabled={busy}
                          onClick={() => handleRemove(item.key)}
                        >
                          Borrar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--light"
                          disabled={busy}
                          onClick={() => setConfirmKey(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="admin-gallery__delete"
                      aria-label={`Borrar foto ${i + 1}`}
                      disabled={busy}
                      onClick={() => setConfirmKey(item.key)}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {errors.length > 0 && (
            <ul className="admin-gallery__errors" role="alert">
              {errors.map((msg, i) => (
                <li key={i} className="admin-error">
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="admin-modal__footer">
          <span className="admin-visually-hidden" aria-live="polite">
            {progress}
          </span>
          <input
            ref={inputRef}
            className="admin-visually-hidden"
            type="file"
            accept="image/*"
            multiple
            tabIndex={-1}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-modal__add"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy && progress ? progress : 'Agregar fotos'}
          </button>
        </footer>
      </div>
    </div>
  )
}
