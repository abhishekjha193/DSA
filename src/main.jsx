import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#191f2b',
              color: '#e8eaf1',
              border: '1px solid #232a3a',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#191f2b' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#191f2b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
