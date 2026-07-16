import { useEffect, useState } from 'react'
import Card from '../common/Card'
import FormField from '../common/FormField'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import MultiSelect from '../common/MultiSelect'
import Button from '../common/Button'
import { CONFIDENCE_LEVEL, DIFFICULTY, PLATFORMS, STATUS } from '../../constants'
import * as topicService from '../../services/topicService'
import * as tagService from '../../services/tagService'

const EMPTY = {
  title: '',
  difficulty: 'Medium',
  platform: 'LeetCode',
  problem_url: '',
  status: 'Not Started',
  confidence_level: '',
  description: '',
  notes: '',
  is_favorite: false,
  is_bookmarked: false,
  topicIds: [],
  tagIds: [],
}

export default function QuestionForm({ initialValue, onSubmit, submitLabel = 'Save Question' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValue })
  const [topics, setTopics] = useState([])
  const [tags, setTags] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    topicService.getTopics().then(setTopics).catch(() => {})
    tagService.getTags().then(setTags).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialValue) {
      // DB columns use null for "empty" (problem_url, confidence_level,
      // description, notes); text inputs need '' instead, or a later
      // .trim() call on a null value throws.
      setForm((f) => ({
        ...f,
        ...initialValue,
        title: initialValue.title ?? '',
        problem_url: initialValue.problem_url ?? '',
        confidence_level: initialValue.confidence_level ?? '',
        description: initialValue.description ?? '',
        notes: initialValue.notes ?? '',
        topicIds: initialValue.topicIds ?? f.topicIds,
        tagIds: initialValue.tagIds ?? f.tagIds,
      }))
    }
  }, [initialValue])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function validate() {
    const next = {}
    if (!form.title?.trim()) next.title = 'Title is required.'
    if (form.problem_url && !/^https?:\/\//i.test(form.problem_url)) {
      next.problem_url = 'URL must start with http:// or https://'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: (form.title ?? '').trim(),
        difficulty: form.difficulty,
        platform: form.platform,
        problem_url: (form.problem_url ?? '').trim() || null,
        status: form.status,
        confidence_level: form.confidence_level || null,
        description: form.description || null,
        notes: form.notes || null,
        is_favorite: form.is_favorite,
        is_bookmarked: form.is_bookmarked,
        topicIds: form.topicIds,
        tagIds: form.tagIds,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="space-y-4 p-5">
        <FormField
          label="Title"
          value={form.title}
          onChange={update('title')}
          error={errors.title}
          placeholder="e.g. Two Sum"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Difficulty" value={form.difficulty} onChange={update('difficulty')}>
            {DIFFICULTY.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
          <Select label="Platform" value={form.platform} onChange={update('platform')}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Select label="Status" value={form.status} onChange={update('status')}>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <FormField
          label="Problem URL"
          value={form.problem_url}
          onChange={update('problem_url')}
          error={errors.problem_url}
          placeholder="https://leetcode.com/problems/two-sum/"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Confidence" value={form.confidence_level} onChange={update('confidence_level')}>
            <option value="">Not set</option>
            {CONFIDENCE_LEVEL.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_favorite}
                onChange={(e) => setForm((f) => ({ ...f, is_favorite: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-surface-2 accent-accent"
              />
              Favorite
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_bookmarked}
                onChange={(e) => setForm((f) => ({ ...f, is_bookmarked: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-surface-2 accent-accent"
              />
              Bookmarked
            </label>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <MultiSelect
          label="Topics"
          options={topics}
          value={form.topicIds}
          onChange={(topicIds) => setForm((f) => ({ ...f, topicIds }))}
          onCreate={async (name) => {
            const created = await topicService.findOrCreateTopic(name)
            setTopics((t) => (t.some((x) => x.id === created.id) ? t : [...t, created]))
            return created
          }}
          placeholder="Search or add a topic…"
        />
        <MultiSelect
          label="Tags"
          options={tags}
          value={form.tagIds}
          onChange={(tagIds) => setForm((f) => ({ ...f, tagIds }))}
          onCreate={async (name) => {
            const created = await tagService.findOrCreateTag(name)
            setTags((t) => (t.some((x) => x.id === created.id) ? t : [...t, created]))
            return created
          }}
          placeholder="Search or add a tag…"
        />
      </Card>

      <Card className="space-y-4 p-5">
        <Textarea
          label="Description"
          value={form.description}
          onChange={update('description')}
          placeholder="Problem statement or a short summary…"
          rows={4}
        />
        <Textarea
          label="Notes"
          value={form.notes}
          onChange={update('notes')}
          placeholder="Mistakes, patterns, edge cases, interview tips…"
          rows={5}
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
