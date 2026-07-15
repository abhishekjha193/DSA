import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Lock } from 'lucide-react'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Every route is its own chunk. This keeps the initial bundle to just the
// shell (layout + auth) — heavy per-page dependencies like Monaco
// (Question Details) and Recharts (Dashboard) only download when a user
// actually visits that page.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Questions = lazy(() => import('./pages/Questions'))
const QuestionDetails = lazy(() => import('./pages/QuestionDetails'))
const AddQuestion = lazy(() => import('./pages/AddQuestion'))
const EditQuestion = lazy(() => import('./pages/EditQuestion'))
const Revisions = lazy(() => import('./pages/Revisions'))
const Settings = lazy(() => import('./pages/Settings'))
const Import = lazy(() => import('./pages/Import'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="flex h-9 w-9 animate-pulse items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Lock size={16} />
      </span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/new" element={<AddQuestion />} />
            <Route path="/questions/:id" element={<QuestionDetails />} />
            <Route path="/questions/:id/edit" element={<EditQuestion />} />
            <Route path="/revisions" element={<Revisions />} />
            <Route path="/import" element={<Import />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
