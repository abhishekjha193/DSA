import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Select from '../components/common/Select'
import { LANGUAGES } from '../constants'
import * as settingsService from '../services/settingsService'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsService
      .getSettings()
      .then(setSettings)
      .catch((err) => toast.error(err.message ?? 'Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  async function handleChange(field, value) {
    setSettings((s) => ({ ...s, [field]: value }))
    setSaving(true)
    try {
      await settingsService.updateSettings({ [field]: value })
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err.message ?? 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your DSA Vault preferences." />

      {loading ? (
        <Card className="flex h-48 items-center justify-center p-6 text-sm text-text-muted">Loading…</Card>
      ) : (
        <Card className="max-w-lg space-y-5 p-5">
          <div>
            <Select
              label="Default programming language"
              value={settings.default_language}
              onChange={(e) => handleChange('default_language', e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-text-muted">
              Used to pre-select the language when you add a new solution. Changing this never
              modifies solutions you've already saved.
            </p>
          </div>

          <Select
            label="Code editor theme"
            value={settings.code_editor_theme}
            onChange={(e) => handleChange('code_editor_theme', e.target.value)}
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
          </Select>

          <Select
            label="Default question view"
            value={settings.default_question_view}
            onChange={(e) => handleChange('default_question_view', e.target.value)}
          >
            <option value="table">Table</option>
            <option value="card">Card</option>
          </Select>

          {saving && <p className="text-xs text-text-muted">Saving…</p>}
        </Card>
      )}
    </div>
  )
}
