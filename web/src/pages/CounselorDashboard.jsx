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
    const r = await fetch('/api/counselor/reports?limit=100')
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
      // On failure, keep previous bookedSessions state (no fallback to mock heuristics)
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
      console.error('Failed to load report', e);
      alert('Failed to load report. Please try again.');
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

      // Stay on dashboard; do not auto-navigate or auto-close modal
      setBookingBusy(false);
      setModal(prev => prev ? { ...prev, bookingNeeded: false } : prev);
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
              // Show "Booking Needed" for medium, high, critical cases OR if explicitly marked as needing booking
              const priorityNeedsBooking = ['medium', 'high', 'crisis'].includes(level) || priorityUpper === 'CRITICAL';
              const effectiveBookingNeeded = (bookingNeeded || priorityNeedsBooking) && !isBooked;
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
                  {effectiveBookingNeeded && (
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        level === 'crisis' || priorityUpper === 'CRITICAL' 
                          ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' 
                          : level === 'high' 
                          ? 'bg-orange-100 text-orange-700 border-orange-300' 
                          : 'bg-amber-100 text-amber-700 border-amber-300'
                      }`}>
                        {level === 'crisis' || priorityUpper === 'CRITICAL' ? '🚨 URGENT BOOKING' : 'Booking needed'}
                      </span>
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
                    {modal.studentInfo?.previousSessions !== undefined && (
                      <div className="flex justify-between items-center py-3">
                        <span className="text-blue-600 font-medium">Previous Sessions</span>
                        <span className="font-semibold text-blue-900">{modal.studentInfo.previousSessions}</span>
                      </div>
                    )}
                  </div>

                  {modal.studentInfo?.primaryConcerns && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Primary Concerns</h4>
                      <div className="flex flex-wrap gap-1">
                        {modal.studentInfo.primaryConcerns.map((concern, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">{concern}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {modal.studentInfo?.identifiedStrengths && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Identified Strengths</h4>
                      <div className="flex flex-wrap gap-1">
                        {modal.studentInfo.identifiedStrengths.map((strength, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{strength}</span>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <div className="py-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-600 font-medium">Suicidal Ideation</span>
                      </div>
                      <span className="text-purple-900 text-xs bg-purple-50 px-2 py-1 rounded">{modal.riskAssessment?.suicidalIdeation || 'N/A'}</span>
                    </div>
                    <div className="py-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-600 font-medium">Self-Harm Risk</span>
                      </div>
                      <span className="text-purple-900 text-xs bg-purple-50 px-2 py-1 rounded">{modal.riskAssessment?.selfHarmRisk || 'N/A'}</span>
                    </div>
                    <div className="py-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-600 font-medium">Isolation Level</span>
                      </div>
                      <span className="text-purple-900 text-xs bg-purple-50 px-2 py-1 rounded">{modal.riskAssessment?.isolation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-purple-600 font-medium">Assessment Confidence</span>
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

                  {modal.riskAssessment?.riskFactors && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Risk Factors</h4>
                      <div className="flex flex-wrap gap-1">
                        {modal.riskAssessment.riskFactors.map((factor, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">{factor}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {modal.riskAssessment?.protectiveFactors && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Protective Factors</h4>
                      <div className="flex flex-wrap gap-1">
                        {modal.riskAssessment.protectiveFactors.map((factor, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{factor}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </section>

            {/* Clinical Notes Section */}
            {modal.clinicalNotes && (
              <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Clinical Assessment
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Presenting Issue</h4>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{modal.clinicalNotes.presentingIssue}</p>
                  </div>
                  
                  {modal.clinicalNotes.mentalStatusExam && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Mental Status Exam</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-2 rounded border">
                          <span className="font-medium text-gray-600">Mood:</span>
                          <span className="ml-2 text-gray-800">{modal.clinicalNotes.mentalStatusExam.mood}</span>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <span className="font-medium text-gray-600">Affect:</span>
                          <span className="ml-2 text-gray-800">{modal.clinicalNotes.mentalStatusExam.affect}</span>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <span className="font-medium text-gray-600">Thought:</span>
                          <span className="ml-2 text-gray-800">{modal.clinicalNotes.mentalStatusExam.thought}</span>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <span className="font-medium text-gray-600">Insight:</span>
                          <span className="ml-2 text-gray-800">{modal.clinicalNotes.mentalStatusExam.insight}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Enhanced Immediate Actions */}
            {modal.immediateActions && modal.immediateActions.length > 0 && (
              <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200 shadow-sm">
                <h3 className="font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Immediate Actions Required
                </h3>
                
                <div className="space-y-3">
                  {modal.immediateActions.map((action, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                      action.priority === 'Critical' ? 'bg-red-100 border-red-500' :
                      action.priority === 'High' ? 'bg-orange-100 border-orange-500' :
                      'bg-yellow-100 border-yellow-500'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{action.action}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          action.priority === 'Critical' ? 'bg-red-200 text-red-800' :
                          action.priority === 'High' ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{action.details}</p>
                      <div className="text-xs text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Timeline: <span className="font-medium">{action.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Conversation Summary */}
            {modal.conversationSummary && modal.conversationSummary !== 'No conversation data available' && (
              <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 shadow-sm">
                <h3 className="font-bold text-lg text-indigo-800 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Conversation Summary
                </h3>
                <div className="bg-white p-4 rounded-lg border text-sm text-gray-700 whitespace-pre-line">
                  {modal.conversationSummary}
                </div>
              </section>
            )}

            <section className="mt-4" id="admin-booking-section">
                <div className="font-semibold mb-2">
                    Admin Booking
                    {modal?.bookingNeeded === true && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                            Recommended
                        </span>
                    )}
                </div>
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
          </div>
        </div>
      </div>
      )}
    </div>
  );
}