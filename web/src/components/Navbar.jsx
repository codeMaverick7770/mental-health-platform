import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
      isActive ? 'text-teal-600 bg-teal-50' : 'text-slate-900 hover:text-teal-600 hover:bg-teal-50'
    }`

  const toggle = () => setOpen((o) => !o)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur border-b z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-4" aria-label="Main">
        <div className="flex items-center gap-3">
          <img src="/assets/branding/umang-logo.jpeg" alt="UMANG logo" className="h-8 w-8 rounded object-cover transform scale-400 origin-center shrink-0" />
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/admin" className={linkClass} onClick={close}>
            Admin
          </NavLink>
          <NavLink to="/counselor" className={linkClass} onClick={close}>
            Counselor
          </NavLink>
          <NavLink to="/voice" className={linkClass} onClick={close}>
            Voice Tester
          </NavLink>
          <NavLink to="/auth" className={linkClass} onClick={close}>
            Login
          </NavLink>    
          
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md border text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={toggle}
        >
          <span className="sr-only">Open main menu</span>
          {open ? (
            // X icon
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t bg-white/95 backdrop-blur">
          <div className="max-w-6xl mx-auto p-2 flex flex-col gap-1">
            <NavLink to="/admin" className={linkClass} onClick={close}>
              Admin
            </NavLink>
            <NavLink to="/counselor" className={linkClass} onClick={close}>
              Counselor
            </NavLink>
            <NavLink to="/voice" className={linkClass} onClick={close}>
              Voice Tester
            </NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
