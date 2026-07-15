import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import { TableSkeleton } from '../components/common/Skeleton'
import SearchBar from '../components/filters/SearchBar'
import FilterPanel from '../components/filters/FilterPanel'
import QuestionTable from '../components/questions/QuestionTable'
import Pagination from '../components/questions/Pagination'
import { useDebounce } from '../hooks/useDebounce'
import * as questionService from '../services/questionService'
import * as topicService from '../services/topicService'
import { supabase } from '../lib/supabase'
import { DEFAULT_PAGE_SIZE } from '../constants'

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState({})
  const [search, setSearch] = useState('')
  const [topics, setTopics] = useState([])

  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    topicService.getTopics().then(setTopics).catch(() => {})
  }, [])

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== undefined && v !== '').length,
    [filters]
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (debouncedSearch.trim()) {
        // Full text search path — bypasses standard pagination for now,
        // matching the spec's emphasis on a fast, simple search experience.
        const { data, error } = await supabase.rpc('search_questions', {
          p_query: debouncedSearch.trim(),
          p_limit: pageSize,
          p_offset: (page - 1) * pageSize,
        })
        if (error) throw error
        setQuestions(data ?? [])
        setTotal(data?.length ?? 0)
        setTotalPages(1)
      } else {
        const result = await questionService.getQuestions({ page, pageSize, filters })
        setQuestions(result.questions)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      }
    } catch (err) {
      toast.error(err.message ?? 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [filters, debouncedSearch, pageSize])

  async function handleToggleFavorite(question) {
    const next = !question.is_favorite
    setQuestions((qs) => qs.map((q) => (q.id === question.id ? { ...q, is_favorite: next } : q)))
    try {
      await questionService.toggleFavorite(question.id, next)
    } catch {
      toast.error('Failed to update favorite')
      load()
    }
  }

  async function handleToggleBookmark(question) {
    const next = !question.is_bookmarked
    setQuestions((qs) => qs.map((q) => (q.id === question.id ? { ...q, is_bookmarked: next } : q)))
    try {
      await questionService.toggleBookmark(question.id, next)
    } catch {
      toast.error('Failed to update bookmark')
      load()
    }
  }

  return (
    <div>
      <PageHeader
        title="Questions"
        description="Browse, filter, and search your question vault."
        actions={
          <Button as={Link} to="/questions/new">
            <Plus size={16} />
            Add Question
          </Button>
        }
      />

      <div className="mb-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          topics={topics}
          activeCount={activeFilterCount}
          onClear={() => setFilters({})}
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={debouncedSearch || activeFilterCount > 0 ? 'No matching questions' : 'No questions added yet'}
          description={
            debouncedSearch || activeFilterCount > 0
              ? 'Try a different search term or clear your filters.'
              : 'Add your first DSA question to start building your vault.'
          }
          action={
            !debouncedSearch && activeFilterCount === 0 && (
              <Button as={Link} to="/questions/new" variant="primary">
                <Plus size={16} />
                Add your first question
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-xl border border-border">
          <QuestionTable
            questions={questions}
            onToggleFavorite={handleToggleFavorite}
            onToggleBookmark={handleToggleBookmark}
          />
          {!debouncedSearch && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}
    </div>
  )
}
