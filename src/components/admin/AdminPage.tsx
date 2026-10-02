import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminProductRow from './AdminProductRow'
import AdminGallery from './AdminGallery'
import { getAdminProducts, type AdminGalleryImage, type AdminProduct } from '../../lib/queries'
import { toggleAvailable, UnauthorizedError } from '../../lib/adminApi'

const SESSION_KEY = 'feria-admin-password'

type StatusFilter = 'all' | 'available' | 'sold'

function readSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function writeSession(password: string | null) {
  try {
    if (password) sessionStorage.setItem(SESSION_KEY, password)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Sin sessionStorage (modo privado estricto): la sesión dura hasta recargar.
  }
}

// Minúsculas y sin tildes, para que "camperon" encuentre "Camperón".
function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(readSession)

  function handleLogin(pw: string) {
    writeSession(pw)
    setPassword(pw)
  }

  const handleLogout = useCallback(() => {
    writeSession(null)
    setPassword(null)
  }, [])

  return (
    <div className="admin">
      {password ? (
        <AdminProducts password={password} onLogout={handleLogout} />
      ) : (
        <AdminLogin onSuccess={handleLogin} />
      )}
    </div>
  )
}

interface AdminProductsProps {
  password: string
  onLogout: () => void
}

function AdminProducts({ password, onLogout }: AdminProductsProps) {
  const [products, setProducts] = useState<AdminProduct[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(() => new Set())
  const [galleryId, setGalleryId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const load = useCallback(async () => {
    setLoadError(null)
    setProducts(null)
    try {
      setProducts(await getAdminProducts())
    } catch (err) {
      console.error('Error cargando productos del admin:', err)
      setLoadError('No se pudieron cargar los productos.')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setAvailable = (id: string, available: boolean) =>
    setProducts((prev) => prev && prev.map((p) => (p.id === id ? { ...p, available } : p)))

  const setGallery = (id: string, gallery: AdminGalleryImage[]) =>
    setProducts((prev) => prev && prev.map((p) => (p.id === id ? { ...p, gallery } : p)))

  const galleryProduct = galleryId ? products?.find((p) => p.id === galleryId) : undefined
  const closeGallery = useCallback(() => setGalleryId(null), [])

  const setIsPending = (id: string, value: boolean) =>
    setPending((prev) => {
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })

  async function handleToggle(product: AdminProduct) {
    const next = !product.available
    setToggleError(null)
    setAvailable(product.id, next)
    setIsPending(product.id, true)
    try {
      await toggleAvailable(product.id, next, password)
    } catch (err) {
      setAvailable(product.id, product.available)
      if (err instanceof UnauthorizedError) {
        onLogout()
        return
      }
      setToggleError(`No se pudo actualizar "${product.name}": ${(err as Error).message}`)
    } finally {
      setIsPending(product.id, false)
    }
  }

  const categories = useMemo(
    () => [...new Set((products ?? []).map((p) => p.category).filter(Boolean))].sort(),
    [products],
  )

  const filtered = useMemo(() => {
    if (!products) return []
    const q = normalize(search.trim())
    return products.filter(
      (p) =>
        (!q || normalize(p.name ?? '').includes(q)) &&
        (!category || p.category === category) &&
        (status === 'all' || (status === 'available' ? p.available : !p.available)),
    )
  }, [products, search, category, status])

  const availableCount = products?.filter((p) => p.available).length ?? 0
  const soldCount = (products?.length ?? 0) - availableCount

  return (
    <>
      <header className="admin-bar">
        <h1 className="admin-bar__title">Productos</h1>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onLogout}>
          Salir
        </button>
      </header>

      {loadError ? (
        <div className="admin-state">
          <p className="admin-error" role="alert">
            {loadError}
          </p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={load}>
            Reintentar
          </button>
        </div>
      ) : !products ? (
        <p className="admin-state">Cargando productos…</p>
      ) : (
        <>
          <div className="admin-controls">
            <p className="admin-count">
              <strong>{availableCount}</strong> disponibles · <strong>{soldCount}</strong> vendidos
            </p>
            <input
              className="admin-input"
              type="search"
              placeholder="Buscar por nombre"
              aria-label="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="admin-controls__row">
              <select
                className="admin-input"
                aria-label="Filtrar por categoría"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="admin-input"
                aria-label="Filtrar por estado"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                <option value="all">Todos</option>
                <option value="available">Disponibles</option>
                <option value="sold">Vendidos</option>
              </select>
            </div>
          </div>

          {toggleError && (
            <div className="admin-toast" role="alert">
              <span>{toggleError}</span>
              <button
                type="button"
                className="admin-toast__close"
                aria-label="Cerrar"
                onClick={() => setToggleError(null)}
              >
                ×
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="admin-state">No hay productos que coincidan.</p>
          ) : (
            <ul className="admin-list">
              {filtered.map((p) => (
                <AdminProductRow
                  key={p.id}
                  product={p}
                  pending={pending.has(p.id)}
                  onToggle={handleToggle}
                  onOpenGallery={(product) => setGalleryId(product.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {galleryProduct && (
        <AdminGallery
          product={galleryProduct}
          password={password}
          onClose={closeGallery}
          onGalleryChange={(gallery) => setGallery(galleryProduct.id, gallery)}
          onUnauthorized={onLogout}
        />
      )}
    </>
  )
}
