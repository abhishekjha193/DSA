import { useState } from 'react'
import { Outlet, useLocation, matchPath } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

const TITLE_ROUTES = [
  { pattern: '/', title: 'Dashboard' },
  { pattern: '/questions', title: 'Questions' },
  { pattern: '/questions/new', title: 'Add Question' },
  { pattern: '/questions/:id', title: 'Question Details' },
  { pattern: '/questions/:id/edit', title: 'Edit Question' },
  { pattern: '/revisions', title: 'Revisions' },
  { pattern: '/import', title: 'Bulk Import' },
  { pattern: '/settings', title: 'Settings' },
]

function resolveTitle(pathname) {
  const match = TITLE_ROUTES.find((route) => matchPath({ path: route.pattern, end: true }, pathname))
  return match?.title ?? 'DSA Vault'
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={resolveTitle(location.pathname)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
