import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RoleProvider } from './contexts/RoleContext'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load main app for faster initial load
const App = lazy(() => import('./App.tsx'))

// Loading fallback
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading Dashboard...</p>
    </div>
  </div>
)

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RoleProvider>
        <Suspense fallback={<LoadingScreen />}>
          <App />
        </Suspense>
      </RoleProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)






