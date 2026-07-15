import { useCallback, useEffect, useState } from 'react'
import { RotateCw } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import { CardGridSkeleton } from '../components/common/Skeleton'
import RevisionRow from '../components/revisions/RevisionRow'
import RevisionModal from '../components/revisions/RevisionModal'
import * as revisionService from '../services/revisionService'

const COLUMN_DEFS = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'dueToday', label: 'Due Today' },
  { key: 'upcoming', label: 'Upcoming (7d)' },
  { key: 'recent', label: 'Recently Revised' },
]

export default function Revisions() {
  const [columns, setColumns] = useState({ overdue: [], dueToday: [], upcoming: [], recent: [] })
  const [loading, setLoading] = useState(true)
  const [activeQuestion, setActiveQuestion] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [due, overdue, upcoming, recent] = await Promise.all([
        revisionService.getDueRevisions(),
        revisionService.getOverdueRevisions(),
        revisionService.getUpcomingRevisions(7),
        revisionService.getRecentlyRevised(10),
      ])
      const overdueIds = new Set(overdue.map((q) => q.id))
      setColumns({
        overdue,
        dueToday: due.filter((q) => !overdueIds.has(q.id)),
        upcoming,
        recent,
      })
    } catch (err) {
      toast.error(err.message ?? 'Failed to load revisions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleRevisionSubmit(payload) {
    try {
      await revisionService.recordRevision(activeQuestion.id, payload)
      toast.success('Revision recorded')
      setActiveQuestion(null)
      load()
    } catch (err) {
      toast.error(err.message ?? 'Failed to record revision')
    }
  }

  const dueCount = columns.overdue.length + columns.dueToday.length

  return (
    <div>
      <PageHeader
        title="Revisions"
        description={
          dueCount > 0
            ? `${dueCount} question${dueCount === 1 ? '' : 's'} need revision right now.`
            : "You're all caught up — nothing due today."
        }
      />

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMN_DEFS.map(({ key, label }) => (
            <Card key={key} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <RotateCw size={14} />
                  {label}
                </div>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-muted">
                  {columns[key].length}
                </span>
              </div>

              <div className="space-y-2">
                {columns[key].length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border-soft text-xs text-text-muted">
                    Nothing here
                  </div>
                ) : (
                  columns[key].map((q) => (
                    <RevisionRow
                      key={q.id}
                      question={q}
                      showDue={key !== 'recent'}
                      onRevise={key !== 'recent' ? setActiveQuestion : undefined}
                    />
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeQuestion && (
        <RevisionModal
          question={activeQuestion}
          onClose={() => setActiveQuestion(null)}
          onSubmit={handleRevisionSubmit}
        />
      )}
    </div>
  )
}
