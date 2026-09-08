import React, { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useIdentity } from './hooks/useIdentity'
import { ToastProvider } from './components/common/Toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import BottomNav from './components/common/BottomNav'
import VerifyPage from './pages/Verify'
import IdentitySelect from './components/common/IdentitySelect'

// Lazy load pages
const HomePage = lazy(() => import('./pages/Home'))
const OurTime = lazy(() => import('./pages/OurTime'))
const FoodPage = lazy(() => import('./pages/food/Food'))
const FoodRecords = lazy(() => import('./pages/food/FoodRecords'))
const FoodRanking = lazy(() => import('./pages/food/FoodRanking'))
const WishFood = lazy(() => import('./pages/food/WishFood'))
const LifePage = lazy(() => import('./pages/life/Life'))
const MovieRecords = lazy(() => import('./pages/life/MovieRecords'))
const TravelRecords = lazy(() => import('./pages/life/TravelRecords'))
const WishTravel = lazy(() => import('./pages/life/WishTravel'))

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/verify" element={<VerifyPageWrapper />} />
        <Route path="/" element={<MainApp />} />
        <Route path="/our-time" element={<MainApp><OurTime /></MainApp>} />
        <Route path="/food" element={<MainApp><FoodPage /></MainApp>} />
        <Route path="/food/records" element={<MainApp><FoodRecords /></MainApp>} />
        <Route path="/food/ranking" element={<MainApp><FoodRanking /></MainApp>} />
        <Route path="/food/wish" element={<MainApp><WishFood /></MainApp>} />
        <Route path="/life" element={<MainApp><LifePage /></MainApp>} />
        <Route path="/life/movies" element={<MainApp><MovieRecords /></MainApp>} />
        <Route path="/life/travel" element={<MainApp><TravelRecords /></MainApp>} />
        <Route path="/life/wish-travel" element={<MainApp><WishTravel /></MainApp>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function VerifyPageWrapper() {
  const { verify } = useAuth()
  return <VerifyPage onVerify={verify} />
}

function MainApp({ children }) {
  return (
    <div className="page-container">
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>加载中...</div>}>
        {children || <HomePage />}
      </Suspense>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const { isAuthed, verify } = useAuth()
  const { identity, setIdentity } = useIdentity()

  if (!isAuthed) {
    return (
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route path="*" element={<VerifyPage onVerify={verify} />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    )
  }

  // 第一次进入 App，未选择身份
  if (!identity) {
    return (
      <ErrorBoundary>
        <AnimatePresence>
          <IdentitySelect onSelect={setIdentity} />
        </AnimatePresence>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary onReset={() => window.location.reload()}>
      <ToastProvider>
        <HashRouter>
          <AnimatedRoutes />
        </HashRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
