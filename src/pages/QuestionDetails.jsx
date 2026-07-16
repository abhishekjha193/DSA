import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Bookmark, ExternalLink, Pencil, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Select from '../components/common/Select'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Textarea from '../components/common/Textarea'
import { DifficultyBadge, StatusBadge } from '../components/common/Badge'
import LanguageTabs from '../components/solutions/LanguageTabs'
import { formatDateTime } from '../utils/formatDate'

// Monaco is the single largest dependency in the app (~900KB). Splitting it
// into its own chunk means it only downloads when someone actually opens
// the Solutions tab, not on every page load.
const SolutionEditor = lazy(() => import('../components/solutions/SolutionEditor'))
import { STATUS, LANGUAGES } from '../constants'
import * as questionService from '../services/questionService'
import * as solutionService from '../services/solutionService'
import * as revisionService from '../services/revisionService'
import * as settingsService from '../services/settingsService'

const TABS = ['Overview', 'Solutions', 'Revision History', 'Notes']

export default function QuestionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [question, setQuestion] = useState(null)
  const [solutions, setSolutions] = useState([])
  const [activeSolutionId, setActiveSolutionId] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [defaultLanguage, setDefaultLanguage] = useState('JavaScript')
  const [editorTheme, setEditorTheme] = useState('vs-dark')
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [q, s, h, settings] = await Promise.all([
        questionService.getQuestionById(id),
        solutionService.getSolutions(id),
        revisionService.getRevisionHistory(id),
        settingsService.getSettings(),
      ])
      setQuestion(q)
      setNotes(q.notes ?? '')
      setSolutions(s)
      setHistory(h)
      setDefaultLanguage(settings.default_language)
      setEditorTheme(settings.code_editor_theme)
      setActiveSolutionId(s.find((sol) => sol.is_primary)?.id ?? s[0]?.id ?? null)
      setAddingNew(s.length === 0)
    } catch (err) {
      toast.error(err.message ?? 'Failed to load question')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggleFavorite() {
    const next = !question.is_favorite
    setQuestion((q) => ({ ...q, is_favorite: next }))
    await questionService.toggleFavorite(id, next).catch(() => toast.error('Failed to update'))
  }

  async function handleToggleBookmark() {
    const next = !question.is_bookmarked
    setQuestion((q) => ({ ...q, is_bookmarked: next }))
    await questionService.toggleBookmark(id, next).catch(() => toast.error('Failed to update'))
  }

  async function handleStatusChange(e) {
    const status = e.target.value
    setQuestion((q) => ({
      ...q,
      status,
      ...(status === 'Revision Needed'
        ? { revision_required: true, next_revision_at: new Date().toISOString() }
        : null),
    }))
    try {
      await questionService.updateQuestionStatus(id, status)
      toast.success(`Marked as ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleDelete() {
    try {
      await questionService.deleteQuestion(id)
      toast.success('Question deleted')
      navigate('/questions')
    } catch (err) {
      toast.error(err.message ?? 'Failed to delete question')
    }
  }

  async function handleSaveSolution(payload, existingId) {
    try {
      if (existingId) {
        await solutionService.updateSolution(existingId, payload)
        toast.success('Solution saved')
      } else {
        const created = await solutionService.createSolution(id, payload)
        toast.success('Solution added')
        setActiveSolutionId(created.id)
        setAddingNew(false)
      }
      const fresh = await solutionService.getSolutions(id)
      setSolutions(fresh)
    } catch (err) {
      toast.error(err.message ?? 'Failed to save solution')
    }
  }

  async function handleDeleteSolution(solutionId) {
    try {
      await solutionService.deleteSolution(solutionId)
      toast.success('Solution deleted')
      const fresh = await solutionService.getSolutions(id)
      setSolutions(fresh)
      setActiveSolutionId(fresh.find((s) => s.is_primary)?.id ?? fresh[0]?.id ?? null)
      setAddingNew(fresh.length === 0)
    } catch (err) {
      toast.error(err.message ?? 'Failed to delete solution')
    }
  }

  async function handleSetPrimary(solutionId) {
    try {
      await solutionService.setPrimarySolution(solutionId)
      const fresh = await solutionService.getSolutions(id)
      setSolutions(fresh)
      toast.success('Primary solution updated')
    } catch {
      toast.error('Failed to update primary solution')
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      await questionService.updateQuestion(id, { notes })
      toast.success('Notes saved')
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return <Card className="flex h-64 items-center justify-center p-6 text-sm text-text-muted">Loading…</Card>
  }
  if (!question) {
    return <Card className="flex h-64 items-center justify-center p-6 text-sm text-text-muted">Question not found</Card>
  }

  const usedLanguages = solutions.map((s) => s.language)
  const availableLanguages = LANGUAGES.filter((l) => !usedLanguages.includes(l))
  const activeSolution = solutions.find((s) => s.id === activeSolutionId)

  return (
    <div>
      <PageHeader
        title={question.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <StatusBadge status={question.status} />
            <span className="text-text-secondary">{question.platform}</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleToggleFavorite} className={question.is_favorite ? 'text-accent' : 'text-text-muted hover:text-text-primary'}>
              <Star size={20} fill={question.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleToggleBookmark} className={question.is_bookmarked ? 'text-info' : 'text-text-muted hover:text-text-primary'}>
              <Bookmark size={20} fill={question.is_bookmarked ? 'currentColor' : 'none'} />
            </button>
            <Button as={Link} to={`/questions/${id}/edit`} variant="secondary" size="sm">
              <Pencil size={14} />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select className="w-48" value={question.status} onChange={handleStatusChange}>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        {question.problem_url && (
          <a
            href={question.problem_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover"
          >
            View problem <ExternalLink size={13} />
          </a>
        )}
        {question.topics?.map((t) => (
          <span key={t.id} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-text-secondary">{t.name}</span>
        ))}
        {question.tags?.map((t) => (
          <span key={t.id} className="rounded-md bg-accent-soft px-2 py-1 text-xs text-accent">{t.name}</span>
        ))}
      </div>

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t ? 'border-b-2 border-accent text-text-primary' : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <Card className="space-y-3 p-5">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted">Description</h4>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-text-secondary">
              {question.description || 'No description added.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border-soft pt-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-text-muted">Confidence</p>
              <p className="mt-0.5 text-text-primary">{question.confidence_level ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Revisions done</p>
              <p className="mt-0.5 text-text-primary">{question.revision_count}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Last revised</p>
              <p className="mt-0.5 text-text-primary">{formatDateTime(question.last_revised_at)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Next revision</p>
              <p className="mt-0.5 text-text-primary">{formatDateTime(question.next_revision_at)}</p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'Solutions' && (
        <Card className="p-5">
          <LanguageTabs
            solutions={solutions}
            activeId={addingNew ? null : activeSolutionId}
            onSelect={(sid) => {
              setActiveSolutionId(sid)
              setAddingNew(false)
            }}
            onAddNew={() => setAddingNew(true)}
          />
          <div className="pt-4">
            <Suspense
              fallback={
                <div className="flex h-96 items-center justify-center text-sm text-text-muted">
                  Loading editor…
                </div>
              }
            >
              {addingNew ? (
                <SolutionEditor
                  isNew
                  solution={{ language: availableLanguages[0] ?? defaultLanguage }}
                  availableLanguages={availableLanguages.length ? availableLanguages : LANGUAGES}
                  editorTheme={editorTheme}
                  onSave={(payload) => handleSaveSolution(payload, null)}
                />
              ) : activeSolution ? (
                <SolutionEditor
                  solution={activeSolution}
                  editorTheme={editorTheme}
                  onSave={(payload) => handleSaveSolution(payload, activeSolution.id)}
                  onDelete={handleDeleteSolution}
                  onSetPrimary={handleSetPrimary}
                />
              ) : (
                <p className="py-12 text-center text-sm text-text-muted">No solutions yet.</p>
              )}
            </Suspense>
          </div>
        </Card>
      )}

      {tab === 'Revision History' && (
        <Card className="p-5">
          {history.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-muted">No revisions recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-border-soft bg-surface-2 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{h.result}</p>
                    <p className="text-xs text-text-muted">{formatDateTime(h.revised_at)}</p>
                  </div>
                  <div className="text-right text-xs text-text-secondary">
                    {h.confidence_before ?? '—'} → {h.confidence_after ?? '—'}
                    {h.time_taken_minutes != null && <p className="text-text-muted">{h.time_taken_minutes} min</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'Notes' && (
        <Card className="space-y-3 p-5">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            placeholder="Mistakes, important observations, patterns, edge cases, interview tips…"
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveNotes} disabled={savingNotes}>
              {savingNotes ? 'Saving…' : 'Save Notes'}
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Question?"
        description="This will permanently delete the question, its solutions, and revision history."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          handleDelete()
        }}
      />
    </div>
  )
}
