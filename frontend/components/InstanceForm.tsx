'use client'

import { useI18n } from "@/locales/I18nContext";
import { useState } from 'react'
import { UmamiInstance, UmamiType } from '@/types'
import { createInstance, updateInstance } from '@/lib/api'

export default function InstanceForm({
  instance,
  onClose,
  onSuccess,
}: {
  instance: UmamiInstance | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    name: instance?.name || '',
    type: instance?.type || 'cloud',
    api_key: '',
    hostname: '',
    username: '',
    password: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (instance) {
        await updateInstance(instance.id, form)
      } else {
        await createInstance(form) // validiert automatisch via /me
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Fehler beim Speichern')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {instance ? 'Instanz bearbeiten' : 'Neue Umami Instanz'}
        </h2>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border rounded p-2"
            required
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="cloud">Cloud</option>
            <option value="self_hosted">Self-Hosted</option>
          </select>

          {form.type === 'cloud' && (
            <input
              name="api_key"
              value={form.api_key}
              onChange={handleChange}
              placeholder="API Key"
              className="w-full border rounded p-2"
              required
            />
          )}

          {form.type === 'self_hosted' && (
            <>
              <input
                name="hostname"
                value={form.hostname}
                onChange={handleChange}
                placeholder="Hostname (https://example.com)"
                className="w-full border rounded p-2"
                required
              />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Benutzername"
                className="w-full border rounded p-2"
                required
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Passwort"
                className="w-full border rounded p-2"
                required
              />
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}