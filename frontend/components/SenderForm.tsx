'use client'

import { useState, useEffect } from 'react'
import { Sender } from '@/types'
import { createSender, updateSender, testSenderConnection } from '@/lib/api'

export default function SenderForm({
  sender,
  onClose,
  onSuccess,
}: {
  sender: Sender | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    use_tls: false,
    use_ssl: false,
    use_auth: true,
  })

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    if (sender) {
      setForm({
        ...sender,
        smtp_password: '',
        use_auth: !!sender.smtp_username,
      })
    }
  }, [sender])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleEncryptionChange = (value: 'none' | 'tls' | 'ssl') => {
    setForm(prev => ({
      ...prev,
      use_tls: value === 'tls',
      use_ssl: value === 'ssl',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      smtp_username: form.use_auth ? form.smtp_username : '',
      smtp_password: form.use_auth ? form.smtp_password : '',
    }

    if (sender) {
      await updateSender(sender.id, payload)
    } else {
      await createSender(payload)
    }
    onSuccess()
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const payload = {
        ...form,
        smtp_username: form.use_auth ? form.smtp_username : '',
        smtp_password: form.use_auth ? form.smtp_password : '',
      }
      await testSenderConnection(payload)
      setTestResult('✅ Verbindung erfolgreich!')
    } catch (e: any) {
      setTestResult(`❌ Fehler: ${e.message || 'Verbindung fehlgeschlagen.'}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {sender ? 'Sender bearbeiten' : 'Neuen Sender hinzufügen'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-Mail"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="text"
            name="smtp_host"
            placeholder="SMTP Host"
            value={form.smtp_host}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="number"
            name="smtp_port"
            placeholder="SMTP Port"
            value={form.smtp_port}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          {/* Auth */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="use_auth"
              checked={form.use_auth}
              onChange={handleChange}
            />
            <label>Authentifizierung erforderlich</label>
          </div>

          {form.use_auth && (
            <>
              <input
                type="text"
                name="smtp_username"
                placeholder="SMTP Benutzer"
                value={form.smtp_username}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
              <input
                type="password"
                name="smtp_password"
                placeholder="SMTP Passwort"
                value={form.smtp_password}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required={!sender}
              />
            </>
          )}

          {/* Encryption */}
          <div>
            <label className="block font-medium mb-1">Verschlüsselung</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="encryption"
                  checked={!form.use_tls && !form.use_ssl}
                  onChange={() => handleEncryptionChange('none')}
                />
                Keine
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="encryption"
                  checked={form.use_tls}
                  onChange={() => handleEncryptionChange('tls')}
                />
                TLS
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="encryption"
                  checked={form.use_ssl}
                  onChange={() => handleEncryptionChange('ssl')}
                />
                SSL
              </label>
            </div>
          </div>

          {/* Test Button */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded"
            >
              {testing ? 'Verbindung wird getestet...' : 'Verbindung testen'}
            </button>
            {testResult && (
              <span className={`text-sm ${testResult.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {testResult}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Abbrechen
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}