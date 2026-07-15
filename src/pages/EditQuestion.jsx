import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import QuestionForm from '../components/questions/QuestionForm'
import * as questionService from '../services/questionService'

export default function EditQuestion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    questionService
      .getQuestionById(id)
      .then((q) =>
        setQuestion({
          ...q,
          topicIds: q.topics.map((t) => t.id),
          tagIds: q.tags.map((t) => t.id),
        })
      )
      .catch((err) => toast.error(err.message ?? 'Failed to load question'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(payload) {
    try {
      await questionService.updateQuestion(id, payload)
      toast.success('Question updated')
      navigate(`/questions/${id}`)
    } catch (err) {
      toast.error(err.message ?? 'Failed to update question')
    }
  }

  return (
    <div>
      <PageHeader title="Edit Question" description={question ? question.title : 'Loading…'} />
      {loading ? (
        <Card className="flex h-64 items-center justify-center p-6 text-sm text-text-muted">Loading…</Card>
      ) : question ? (
        <QuestionForm initialValue={question} onSubmit={handleSubmit} submitLabel="Save Changes" />
      ) : (
        <Card className="flex h-64 items-center justify-center p-6 text-sm text-text-muted">Question not found</Card>
      )}
    </div>
  )
}
