import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  OctagonAlert,
  AlertTriangle,
  CalendarDays,
  MessageCircle,
  Timer,
  Zap,
  User as UserIcon,
  ShieldAlert,
  Clock,
  X
} from 'lucide-react';

// Mock data for standalone functionality (populated in catch blocks)
const mockReports = [
  {
    sessionId: "sess_abc1234567",
    priority: "HIGH",
    studentInfo: {
      messageCount: 12,
      sessionDuration: 35,
      engagementLevel: "medium"
    },
    immediateActions: [
      {
        action: "Recommend follow-up session",
        priority: "MEDIUM",
        details: "Student expressed mild anxiety.",
        timeline: "Within 48 hours"
      }
    ],
    riskAssessment: {
      overallRisk: "high",
      suicidalIdeation: "low",
      selfHarmRisk: "low",
      isolation: "medium",
      confidence: 0.85
    },
    startedAt: new Date(Date.now() - 86400000).toISOString() // yesterday
  },
  {
    sessionId: "sess_def9876543",
    priority: "CRITICAL",
    studentInfo: {
      messageCount: 28,
      sessionDuration: 75,
      engagementLevel: "high"
    },
    immediateActions: [
      {
        action: "Immediate referral to crisis team",
        priority: "CRITICAL",
        details: "Expressed suicidal thoughts.",
        timeline: "Immediate"
      },
      {
        action: "Contact emergency services if needed",
        priority: "HIGH",
        details: "",
        timeline: "ASAP"
      }
    ],
    riskAssessment: {
      overallRisk: "critical",
      suicidalIdeation: "high",
      selfHarmRisk: "high",
      isolation: "high",
      confidence: 0.3
    },
    startedAt: new Date().toISOString() // today
  },
  {
    sessionId: "sess_ghi11223344",
    priority: "MEDIUM",
    studentInfo: {
      messageCount: 8,
      sessionDuration: 20,
      engagementLevel: "low"
    },
    immediateActions: [],
    riskAssessment: {
      overallRisk: "medium",
      suicidalIdeation: "none",
      selfHarmRisk: "low",
      isolation: "low",
      confidence: 0.95
    },
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString() // 2 days ago
  },
  {
    sessionId: "sess_jkl55667788",
    priority: "LOW",
    studentInfo: {
      messageCount: 5,
      sessionDuration: 10,
      engagementLevel: "low"
    },
    immediateActions: [],
    riskAssessment: {
      overallRisk: "low",
      suicidalIdeation: "none",
      selfHarmRisk: "none",
      isolation: "low",
      confidence: 0.98
    },
    startedAt: new Date().toISOString() // today
  }
];

const mockEvents = [
  {
    sessionId: "sess_def9876543",
    riskLevel: "high",
    type: "sos"
  },
  {
    sessionId: "sess_abc1234567",
    riskLevel: "medium",
    type: "alert"
  }
];

const mockModal = {
  sessionId: "",
  studentInfo: {
    sessionDuration: 45,
    messageCount: 18,
    engagementLevel: "medium"
  },
  riskAssessment: {
    overallRisk: "medium",
    suicidalIdeation: "low",
    selfHarmRisk: "medium",
    isolation: "low",
    confidence: 0.75
  },
  immediateActions: [
    {
      priority: "HIGH",
      action: "Schedule urgent follow-up",
      details: "Monitor for escalation.",
      timeline: "Within 24 hours"
    },
    {
      priority: "MEDIUM",
      action: "Provide resources",
      details: "Share coping strategies.",
      timeline: "Immediate"
    }
  ]
};

export default function CounselorDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, activeToday: 0 });
  // removed events state; backend provides sufficient data
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookedSessions, setBookedSessions] = useState(new Set());

  async function refresh() {
    const r = await fetch('/api/counselor/reports?limit=50')
      .then(r => r.json()).catch(() => ({ reports: [] }));
    setReports(r.reports || []);
    // alerts fetch removed
    const list = r.reports || [];
    const total = list.length;
    const critical = list.filter(x => x.priority === 'CRITICAL').length;
    const high = list.filter(x => x.priority === 'HIGH').length;
    const activeToday = list.filter(x => {
      const d = new Date(x.startedAt);
      const t = new Date();
      return d.toDateString() === t.toDateString();
    }).length;
    setStats({ total, critical, high, activeToday });

    // Check for booked sessions from database
    try {
      const sessionsResponse = await fetch('/api/counselor/sessions')
        .then(r => r.json()).catch(() => ({ sessions: [] }));
      const bookedSessionIds = new Set((sessionsResponse.sessions || []).map(s => s.sessionId));
      setBookedSessions(bookedSessionIds);
    } catch (error) {
      console.error('Failed to fetch booked sessions:', error);
      // Fallback: check if any reports have bookingNeeded: false (indicating they're booked)
      const bookedFromReports = new Set(
        list.filter(rep => rep.bookingNeeded === false).map(rep => rep.sessionId)
      );
      setBookedSessions(bookedFromReports);
    }
  }
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  // Open a single counselor report in a modal
  async function openReport(sessionId) {
    try {
      const r = await fetch(`/api/counselor/report/${sessionId}`);
      const data = await r.json();
      const overall = (data?.riskAssessment?.overallRisk || '').toString().toLowerCase();
      const pri = (data?.priority || '').toString().toUpperCase();
      const bookingNeeded = data?.bookingNeeded ?? (overall === 'high' || overall === 'critical' || pri === 'CRITICAL');
      setModal({ ...data, sessionId, bookingNeeded });
    } catch (e) {
      // Fallback to mock modal if API fails
      setModal({ ...mockModal, sessionId });
    }
  }

  // Download current modal report as JSON
  function downloadReport() {
    try {
      const blob = new Blob([JSON.stringify(modal || {}, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counselor-report-${(modal?.sessionId || 'session').slice(-8)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  }

  // Admin booking action from modal
  async function submitAdminBooking() {
    if (!modal?.sessionId) return;
    setBookingBusy(true);
    try {
      // Call booking proxy (voice assistant -> backend)
      const resp = await fetch('/api/book/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: modal.sessionId,
          risk: modal?.riskAssessment?.overallRisk || 'medium',
          source: 'counselor-dashboard'
        })
      });

      if (!resp.ok) {
        const text = await resp.text();
        alert(`Booking failed: ${resp.status} ${text}`);
        setBookingBusy(false);
        return;
      }

      const data = await resp.json().catch(() => ({}));
      // Mark locally as booked
      setBookedSessions(prev => new Set([...Array.from(prev), modal.sessionId]));

      // Ensure session is visible in My Sessions with scheduled status
      try {
        await fetch(`/api/counselor/session/${modal.sessionId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'scheduled' })
        });
      } catch {}

      // Navigate to My Sessions for counselor to proceed
      try { navigate('/counselor-sessions'); } catch {}

      setBookingBusy(false);
      setModal(null);
    } catch (e) {
      alert(`Admin booking error: ${e?.message || e}`);
      setBookingBusy(false);
    }
  }

  const shown = filter === 'all'
    ? reports
    : reports.filter(r => r.priority?.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-8 text-center sm:text-left tracking-tight shadow-lg drop-shadow-sm">Counselor Dashboard</h1>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white shadow p-4 border text-center hover:shadow-lg transition">
              <div className="text-sm text-gray-500">Total Sessions</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="rounded-2xl bg-white shadow p-4 border text-center hover:shadow-lg transition">
              <div className="text-sm text-gray-500">Critical Cases</div>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </div>
            <div className="rounded-2xl bg-white shadow p-4 border text-center hover:shadow-lg transition">
              <div className="text-sm text-gray-500">High Priority</div>
              <div className="text-2xl font-bold text-orange-500">{stats.high}</div>
            </div>
            <div className="rounded-2xl bg-white shadow p-4 border text-center hover:shadow-lg transition">
              <div className="text-sm text-gray-500">Active Today</div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeToday}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map(p => (
              <button key={p} onClick={() => setFilter(p)}
                className={`px-3 py-1 rounded-full border ${filter === p ? 'bg-teal-600 text-white' : 'bg-white hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {shown.map(rep => {
              // Prefer server-driven fields; priority=CRITICAL should override styling
              const priorityUpper = (rep.priority || '').toString().toUpperCase();
              let level = priorityUpper === 'CRITICAL'
                ? 'crisis'
                : (rep.riskLevel || '').toString().toLowerCase();
              if (level === 'critical') level = 'crisis';
              if (!['low','medium','high','crisis'].includes(level)) level = 'low';
              const displayText = priorityUpper === 'CRITICAL' ? 'CRITICAL' : (level || 'low').toString().toUpperCase();
              const bookingNeeded = Boolean(rep.bookingNeeded);
              const isBooked = bookedSessions.has(rep.sessionId);
              const cardAccent = level === 'crisis' ? 'border-red-300' : level === 'high' ? 'border-orange-300' : level === 'medium' ? 'border-yellow-300' : 'border-green-300';
              const riskPill = level === 'crisis' ? 'bg-red-100 text-red-700 border-red-300' :
                level === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300';
              return (
                <button key={rep.sessionId} onClick={() => openReport(rep.sessionId)}
                  className={`text-left bg-white rounded-xl shadow p-4 border ${cardAccent} hover:shadow-md transition`}>
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span className="font-mono">Session {rep.sessionId.slice(-8)}</span>
                    <div className="flex items-center gap-2">
                      {isBooked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">Booked</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${riskPill}`}>{displayText}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">Messages: {rep.studentInfo?.messageCount}</div>
                  <div className="text-sm">Duration: {rep.studentInfo?.sessionDuration} min</div>
                  {rep.immediateActions?.length>0 && (
                    <div className="mt-2 text-sm">
                      <div className="font-semibold">Immediate actions</div>
                      <ul className="list-disc ml-5">
                        {rep.immediateActions.slice(0,2).map((a,i)=>(<li key={i}>{a.action}</li>))}
                      </ul>
                    </div>
                  )}
                  {bookingNeeded && (
                    <div className="mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">Booking needed</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-auto p-6"
               onClick={(e)=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Counselor Report • {modal.sessionId.slice(-8)}</h2>
              <div className="flex items-center gap-2">
                <button onClick={downloadReport} className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm">Download</button>
                <button onClick={()=>setModal(null)} className="w-8 h-8 rounded-full bg-gray-100">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <section className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="font-bold text-lg text-blue-800 mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5" /> Student Information</h3>

                  <div className="space-y-3 text-sm divide-y divide-blue-100">
                    <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                      <span className="text-blue-600 font-medium">Session Duration</span>
                      <span className="font-semibold text-blue-900 bg-blue-100 px-2 py-1 rounded-lg text-xs">{modal.studentInfo?.sessionDuration || 0} minutes</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-blue-600 font-medium">Message Count</span>
                      <span className="font-semibold text-blue-900">{modal.studentInfo?.messageCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-blue-600 font-medium">Engagement Level</span>
                      <span className="font-semibold text-green-600 capitalize px-2 py-1 bg-green-100 rounded-full text-xs">{modal.studentInfo?.engagementLevel || 'medium'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
                  <h3 className="font-bold text-lg text-purple-800 mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Risk Assessment</h3>

                  <div className="space-y-3 text-sm divide-y divide-purple-100">
                    <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                      <span className="text-purple-600 font-medium">Overall Risk</span>
                      <span className={`font-semibold px-3 py-1 rounded-full text-xs capitalize shadow-sm ${
                        modal.riskAssessment?.overallRisk === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' : 
                        modal.riskAssessment?.overallRisk === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {modal.riskAssessment?.overallRisk || 'medium'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-purple-600 font-medium">Suicidal Ideation</span>
                      <span className="font-semibold text-purple-900 capitalize">{modal.riskAssessment?.suicidalIdeation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-purple-600 font-medium">Self-Harm Risk</span>
                      <span className="font-semibold text-purple-900 capitalize">{modal.riskAssessment?.selfHarmRisk || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-purple-600 font-medium">Isolation Level</span>
                      <span className="font-semibold text-purple-900 capitalize">{modal.riskAssessment?.isolation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-purple-600 font-medium">Confidence Score</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full shadow-inner transition-all duration-500 ease-out" 
                            style={{width: `${(modal.riskAssessment?.confidence || 0) * 100}%`}}
                          ></div>
                        </div>
                        <span className="font-bold text-purple-800 text-sm min-w-[40px] text-right">{Math.round((modal.riskAssessment?.confidence || 0)*100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Admin Booking section based on server flag */}
              {(modal?.bookingNeeded === true) && (
                <section className="mt-4" id="admin-booking-section">
                  <div className="font-semibold mb-2">Admin Booking</div>
                  {bookedSessions.has(modal?.sessionId) ? (
                    <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-green-700 font-medium">Session is already booked</span>
                      </div>
                      <div className="text-green-600 text-xs mt-1">This session has been assigned to a counselor and is ready for counseling.</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600">Automatically assigns counselor and earliest slot based on availability.</div>
                      <div className="mt-3">
                        <button
                          onClick={submitAdminBooking}
                          disabled={bookingBusy}
                          className={`px-4 py-2 rounded ${bookingBusy ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
                        >
                          {bookingBusy ? 'Booking…' : 'Book via Admin'}
                        </button>
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}