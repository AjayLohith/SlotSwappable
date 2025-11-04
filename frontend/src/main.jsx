import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Requests from './pages/Requests'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: '/marketplace', element: <ProtectedRoute><Marketplace /></ProtectedRoute> },
      { path: '/requests', element: <ProtectedRoute><Requests /></ProtectedRoute> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> }
    ]
  }
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)


