import { useState } from 'react'
import { login, UnauthorizedError } from '../../lib/adminApi'

interface AdminLoginProps {
  onSuccess: (password: string) => void
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || loading) return
    setLoading(true)
    setError(null)
    try {
      await login(password)
      onSuccess(password)
    } catch (err) {
      setError(err instanceof UnauthorizedError ? 'Contraseña incorrecta' : (err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">Panel de administración</h1>
        <label className="admin-login__label" htmlFor="admin-password">
          Contraseña
        </label>
        <input
          id="admin-password"
          className="admin-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <button className="admin-btn admin-btn--primary" type="submit" disabled={!password || loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
