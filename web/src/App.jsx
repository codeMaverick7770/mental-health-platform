import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CounselorDashboard from './pages/CounselorDashboard.jsx'
import CounselorSessionPage from './pages/CounselorSessionPage.jsx'
import VoiceTester from './pages/VoiceTester.jsx'
import Navbar from './components/Navbar.jsx'
import AuthPage from './pages/AuthPage.jsx'

// Layout wrapper to conditionally show Navbar
function Layout({ children }) {
  const location = useLocation();
  const hideNavbarRoutes = ['/'];
  
  return (
    <div className="min-h-screen">
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      {children}
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Dashboard Routes - wrapped with container */}
          <Route path="/admin" element={
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
              <main className="max-w-6xl mx-auto p-4">
                <AdminDashboard />
              </main>
            </div>
          } />
          <Route path="/counselor" element={
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
              <main className="max-w-6xl mx-auto p-4">
                <CounselorDashboard />
              </main>
            </div>
          } />
          <Route path="/counselor-sessions" element={
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
              <main className="max-w-6xl mx-auto p-4">
                <CounselorSessionPage />
              </main>
            </div>
          } />
          <Route path="/voice" element={
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
              <main className="max-w-6xl mx-auto p-4">
                <VoiceTester />
              </main>
            </div>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}