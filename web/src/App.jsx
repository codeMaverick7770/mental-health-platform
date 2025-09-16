import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CounselorDashboard from './pages/CounselorDashboard.jsx'
import VoiceTester from './pages/VoiceTester.jsx'
export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="sticky top-0 bg-white/70 backdrop-blur border-b">
          <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <div className="font-bold tracking-tight text-slate-800">🧠 Mental Health Platform</div>
            <div className="flex gap-2">
            <NavLink to="/admin" className={({ isActive }) => `font-semibold ${isActive ? 'text-teal-600' : 'text-gray-900 hover:text-teal-600'}`}>Admin</NavLink>
            <NavLink to="/counselor" className={({ isActive }) => `font-semibold ${isActive ? 'text-teal-600' : 'text-gray-900 hover:text-teal-600'}`}>Counselor</NavLink>
            <NavLink to="/voice" className={({ isActive }) => `font-semibold ${isActive ? 'text-teal-600' : 'text-gray-900 hover:text-teal-600'}`}>Voice Tester</NavLink>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace/>}/>
            <Route path="/admin" element={<AdminDashboard/>}/>
            <Route path="/counselor" element={<CounselorDashboard/>}/>
            <Route path="/voice" element={<VoiceTester/>}/>
            <Route path="*" element={<Navigate to="/admin" replace/>}/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}