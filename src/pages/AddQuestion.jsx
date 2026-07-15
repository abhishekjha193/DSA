import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import QuestionForm from '../components/questions/QuestionForm'
import * as questionService from '../services/questionService'

export default function AddQuestion() {
  const navigate = useNavigate()

  async function handleSubmit(payload) {
    try {
      const created = await questionService.createQuestion(payload)
      toast.success('Question added')
      navigate(`/questions/${created.id}`)
    } catch (err) {
      toast.error(err.message ?? 'Failed to add question. Check for a duplicate URL or title.')
    }
  }

  return (
    <div>
      <PageHeader title="Add Question" description="Save a new problem to your vault." />
      <QuestionForm onSubmit={handleSubmit} submitLabel="Add Question" />
    </div>
  )
}
