import { useEffect, useState } from 'react';

export default function CounselorDashboard() {
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

  function downloadReport(){
    try {
      if (!modal) return;
      const w = window.open('', '_blank');
      if (!w) return;
      const title = `Counselor Report • ${String(modal.sessionId || '').slice(-8)}`;
      const style = `
        <style>
          body{font-family:ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;padding:24px;color:#111}
          h1{font-size:20px;margin:0 0 12px}
          h2{font-size:16px;margin:16px 0 8px}
          .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          .card{border:1px solid #e5e7eb;border-radius:12px;padding:12px}
          .muted{color:#6b7280}
          ul{margin:0;padding-left:18px}
          @media print { button{display:none} }
        </style>`;
      const sectionInfo = `
        <div class="grid">
          <div class="card">
            <h2>Student Info</h2>
            <div class="muted">Duration: ${modal.studentInfo?.sessionDuration ?? ''} min</div>
            <div class="muted">Messages: ${modal.studentInfo?.messageCount ?? ''}</div>
            <div class="muted">Engagement: ${modal.studentInfo?.engagementLevel ?? ''}</div>
          </div>
          <div class="card">
            <h2>Risk Assessment</h2>
            <div>Overall: ${modal.riskAssessment?.overallRisk ?? ''}</div>
            <div>Suicidal ideation: ${modal.riskAssessment?.suicidalIdeation ?? ''}</div>
            <div>Self-harm: ${modal.riskAssessment?.selfHarmRisk ?? ''}</div>
            <div>Isolation: ${modal.riskAssessment?.isolation ?? ''}</div>
            <div>Confidence: ${Math.round(((modal.riskAssessment?.confidence)||0)*100)}%</div>
          </div>
        </div>`;
      const sectionActions = (modal.immediateActions?.length ? `
        <div class="card" style="margin-top:12px">
          <h2>Immediate actions</h2>
          <ul>
            ${modal.immediateActions.map(a=>`<li><strong>${a.priority}</strong>: ${a.action}${a.details?` — <span class='muted'>${a.details}</span>`:''}${a.timeline?` (Timeline: ${a.timeline})`:''}</li>`).join('')}
          </ul>
        </div>` : '');
      w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>${title}</title>${style}</head><body>
        <h1>${title}</h1>
        ${sectionInfo}
        ${sectionActions}
        <div style="margin-top:16px"><button onclick="window.print()">Print / Save as PDF</button></div>
      </body></html>`);
      w.document.close();
      w.focus();
    } catch (err) {
      if (typeof console !== 'undefined') console.error(err);
    }
  }

  async function submitAdminBooking(){
    try {
      setBookingBusy(true);
      const priority = (modal?.riskAssessment?.overallRisk || modal?.priority || '').toString().toUpperCase();
      const resp = await fetch('/api/book/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: modal?.sessionId, priority })
      });
      const text = await resp.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* ignore parse error */ }
      if (!resp.ok){
        const message = (data && (data.error || data.message)) || text || `HTTP ${resp.status}`;
        throw new Error(message);
      }
      if (!data){
        alert('Booked successfully (no JSON body returned).');
      } else {
        // Check if session was already booked
        if (data.error === "Session already booked") {
          alert(`⚠️ ${data.message}`);
          return; // Don't show success message
        }
        const name = data.assigned?.counsellorName || data.session?.counsellorName || 'counsellor';
        const slot = data.assigned?.slot || data.session?.scheduledAt;
        alert(`✅ Booked with ${name}${slot ? ` @ ${new Date(slot).toLocaleString()}` : ''}`);
        
        // Mark session as booked and refresh from DB
        setBookedSessions(prev => new Set([...prev, modal?.sessionId]));
        try {
          const sessionsResponse = await fetch('/api/counselor/sessions')
            .then(r => r.json()).catch(() => ({ sessions: [] }));
          const bookedSessionIds = new Set((sessionsResponse.sessions || []).map(s => s.sessionId));
          setBookedSessions(bookedSessionIds);
        } catch {
          // ignore fetch error; will sync on next refresh
        }
      }
      setBookingBusy(false);
    } catch(e){
      alert(`Admin booking failed: ${e.message || e}`);
      setBookingBusy(false);
    }
  }

  async function openReport(sessionId, opts = {}) {
    try {
      const r = await fetch(`/api/counselor/report/${sessionId}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setModal(data);
      if (opts.focusBooking) {
        setTimeout(() => {
          const el = document.getElementById('admin-booking-section');
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    } catch (e) {
      if (typeof console !== 'undefined') console.error(e);
      alert('Failed to load report');
    }
  }

  const shown = filter === 'all'
    ? reports
    : reports.filter(r => r.priority?.toLowerCase() === filter);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Counselor Dashboard</h1>

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

            <section className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="font-semibold mb-1">Student Info</div>
                <div>Duration: {modal.studentInfo.sessionDuration} min</div>
                <div>Messages: {modal.studentInfo.messageCount}</div>
                <div>Engagement: {modal.studentInfo.engagementLevel}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-semibold mb-1">Risk Assessment</div>
                <div>Overall: {modal.riskAssessment.overallRisk}</div>
                <div>Suicidal ideation: {modal.riskAssessment.suicidalIdeation}</div>
                <div>Self‑harm: {modal.riskAssessment.selfHarmRisk}</div>
                <div>Isolation: {modal.riskAssessment.isolation}</div>
                <div>Confidence: {Math.round((modal.riskAssessment.confidence||0)*100)}%</div>
              </div>
            </section>

            {modal.immediateActions?.length>0 && (
              <section className="mt-4 text-sm">
                <div className="font-semibold mb-1">Immediate actions</div>
                <ul className="space-y-2">
                  {modal.immediateActions.map((a,i)=>(
                    <li key={i} className="rounded border p-2">
                      <div className="font-semibold">{a.priority}</div>
                      <div>{a.action}</div>
                      {a.details && <div className="text-gray-600">{a.details}</div>}
                      {a.timeline && <div className="text-gray-500">Timeline: {a.timeline}</div>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
      )}
    </div>
  );
}