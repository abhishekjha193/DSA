import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, ListChecks, RotateCw, Star, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'
import { StatGridSkeleton } from '../components/common/Skeleton'
import DifficultyChart from '../components/dashboard/DifficultyChart'
import BarChartCard from '../components/dashboard/BarChartCard'
import * as dashboardService from '../services/dashboardService'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [difficulty, setDifficulty] = useState([])
  const [platform, setPlatform] = useState([])
  const [topic, setTopic] = useState([])
  const [language, setLanguage] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, diffRes, platRes, topicRes, langRes] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getDifficultyStats(),
          dashboardService.getPlatformStats(),
          dashboardService.getTopicStats(),
          dashboardService.getLanguageStats(),
        ])
        setStats(statsRes)
        setDifficulty(diffRes)
        setPlatform(platRes)
        setTopic(topicRes)
        setLanguage(langRes)
      } catch (err) {
        toast.error(err.message ?? 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Questions', value: stats.total_questions, icon: ListChecks },
        { label: 'Solved', value: stats.solved, icon: CheckCircle2 },
        { label: 'Not Started', value: stats.not_started, icon: Circle },
        { label: 'Mastered', value: stats.mastered, icon: Trophy },
        { label: 'Revision Due Today', value: stats.revision_due_today, icon: RotateCw },
        { label: 'Favorites', value: stats.favorites, icon: Star },
      ]
    : []

  return (
    <div>
      <PageHeader title="Dashboard" description="Your DSA practice at a glance." />

      {loading ? (
        <StatGridSkeleton />
      ) : !stats ? (
        <Card className="p-6 text-center text-sm text-text-secondary">
          Couldn't load dashboard stats. Make sure the SQL migrations (especially
          <code className="mx-1 rounded bg-surface-2 px-1.5 py-0.5 text-xs text-text-primary">
            010_functions.sql
          </code>
          ) have been run in your Supabase project, then refresh.
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">{label}</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-accent">
                    <Icon size={16} />
                  </span>
                </div>
                <p className="mt-3 font-display text-3xl font-semibold text-text-primary">{value}</p>
              </Card>
            ))}
          </div>

          {stats.overdue_revisions > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger">
              <RotateCw size={15} />
              {stats.overdue_revisions} revision{stats.overdue_revisions === 1 ? '' : 's'} overdue — visit the Revisions page to catch up.
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DifficultyChart data={difficulty} />
            <BarChartCard title="Questions by Platform" data={platform} dataKey="count" labelKey="platform" color="var(--color-info)" />
            <BarChartCard title="Top Topics" data={topic} dataKey="count" labelKey="topic" color="var(--color-accent)" />
            <BarChartCard title="Solutions by Language" data={language} dataKey="count" labelKey="language" color="var(--color-success)" />
          </div>
        </>
      )}
    </div>
  )
}