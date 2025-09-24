import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CounselorDashboard from './pages/CounselorDashboard.jsx'
import CounselorSessionPage from './pages/CounselorSessionPage.jsx'
import VoiceTester from './pages/VoiceTester.jsx'
import Navbar from './components/Navbar.jsx'
import AuthPage from './pages/AuthPage.jsx'   
export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace/>}/>
            <Route path="/admin" element={<AdminDashboard/>}/>
            <Route path="/counselor" element={<CounselorDashboard/>}/>
            <Route path="/counselor-sessions" element={<CounselorSessionPage/>}/>
            <Route path="/voice" element={<VoiceTester/>}/>
            <Route path="*" element={<Navigate to="/admin" replace/>}/>
            <Route path="/auth" element={<AuthPage/>}/>   
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}