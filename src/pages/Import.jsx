import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileWarning, CheckCircle2, Download, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import * as importService from '../services/importService'

export default function Import() {
  const navigate = useNavigate()
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState([])
  const [validation, setValidation] = useState(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setResult(null)
    setFileName(file.name)

    try {
      const parsed = file.name.toLowerCase().endsWith('.json')
        ? await importService.parseJSON(file)
        : await importService.parseCSV(file)

      setRows(parsed)
      setValidation(importService.validateImport(parsed))
    } catch (err) {
      setError(err.message ?? 'Failed to parse file. Check the format and try again.')
      setRows([])
      setValidation(null)
    }
  }

  async function handleImport() {
    if (!validation?.valid.length) return
    setImporting(true)
    setProgress({ processed: 0, total: validation.valid.length })

    try {
      const dataRows = validation.valid.map((v) => v.data)
      const totals = await importService.bulkImportQuestions(dataRows, {
        onProgress: (p) => setProgress(p),
      })
      setResult(totals)
      toast.success(`Imported ${totals.success} question${totals.success === 1 ? '' : 's'}`)
    } catch (err) {
      toast.error(err.message ?? 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    const csv = `${importService.CSV_TEMPLATE_HEADER}\n${importService.CSV_TEMPLATE_EXAMPLE_ROW}\n`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dsa-vault-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setFileName('')
    setRows([])
    setValidation(null)
    setResult(null)
    setProgress(null)
    setError('')
  }

  return (
    <div>
      <PageHeader
        title="Bulk Import"
        description="Import questions in bulk from a CSV or JSON file — built to handle 2,000+ rows at once."
        actions={
          <Button variant="secondary" size="sm" onClick={downloadTemplate}>
            <Download size={14} />
            Download CSV template
          </Button>
        }
      />

      {!result && (
        <Card className="p-6">
          {!fileName ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center transition-colors hover:border-accent-dim">
              <UploadCloud size={28} className="mb-3 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">
                Click to choose a CSV or JSON file
              </span>
              <span className="mt-1 text-xs text-text-muted">
                Columns: title, difficulty, platform, problem_url, status, topics, language, code…
              </span>
              <input type="file" accept=".csv,.json" className="hidden" onChange={handleFile} />
            </label>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-border-soft pb-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">{fileName}</p>
                  <p className="text-xs text-text-muted">{rows.length} rows parsed</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset} disabled={importing}>
                  Choose a different file
                </Button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                  <XCircle size={15} />
                  {error}
                </div>
              )}

              {validation && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border-soft bg-surface-2 p-3 text-center">
                    <p className="font-display text-xl font-semibold text-success">
                      {validation.valid.length}
                    </p>
                    <p className="text-xs text-text-muted">Ready to import</p>
                  </div>
                  <div className="rounded-lg border border-border-soft bg-surface-2 p-3 text-center">
                    <p className="font-display text-xl font-semibold text-danger">
                      {validation.invalid.length}
                    </p>
                    <p className="text-xs text-text-muted">Missing title (skipped)</p>
                  </div>
                  <div className="rounded-lg border border-border-soft bg-surface-2 p-3 text-center">
                    <p className="font-display text-xl font-semibold text-warning">
                      {validation.valid.filter((v) => v.warnings.length).length}
                    </p>
                    <p className="text-xs text-text-muted">Rows with warnings</p>
                  </div>
                </div>
              )}

              {validation?.invalid.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-border-soft bg-surface-2 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <FileWarning size={13} />
                    Rows that will be skipped
                  </p>
                  {validation.invalid.slice(0, 20).map((item) => (
                    <p key={item.row} className="text-xs text-text-muted">
                      Row {item.row}: {item.reasons.join(', ')}
                    </p>
                  ))}
                </div>
              )}

              {importing && progress && (
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
                    <span>Importing…</span>
                    <span>
                      {progress.processed} / {progress.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <Button onClick={handleImport} disabled={importing || !validation?.valid.length}>
                  {importing
                    ? 'Importing…'
                    : `Import ${validation?.valid.length ?? 0} question${validation?.valid.length === 1 ? '' : 's'}`}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {result && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-text-primary">
                Import complete
              </h3>
              <p className="text-sm text-text-secondary">
                {result.success} added · {result.skipped_duplicates} duplicates skipped ·{' '}
                {result.failed} failed
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-border-soft bg-surface-2 p-3">
              <p className="mb-2 text-xs font-medium text-text-secondary">Failure details</p>
              {result.errors.slice(0, 30).map((e, i) => (
                <p key={i} className="text-xs text-text-muted">
                  {e.item?.title || 'Untitled'}: {e.error}
                </p>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Button onClick={() => navigate('/questions')}>Go to Questions</Button>
            <Button variant="secondary" onClick={reset}>
              Import another file
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
