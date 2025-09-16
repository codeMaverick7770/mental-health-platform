import { useEffect, useState } from 'react';

export default function CounselorDashboard() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, activeToday: 0 });
  const [events, setEvents] = useState([]);

  async function refresh() {
    const r = await fetch('/api/counselor/reports?limit=50')
      .then(r => r.json()).catch(() => ({ reports: [] }));
    setReports(r.reports || []);
    // also get latest realtime alerts/insights to reflect highest risk like admin dashboard
    const a = await fetch('/api/admin/alerts').then(r=>r.json()).catch(()=>({ alerts: [], realtime: [] }));
    setEvents(a?.realtime || []);
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
  }
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  async function openReport(sessionId) {
    try {
      const r = await fetch(`/api/counselor/report/${sessionId}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setModal(data);
    } catch (e) {
      alert('Failed to load report');
    }
  }

  const shown = filter === 'all'
    ? reports
    : reports.filter(r => r.priority?.toLowerCase() === filter);

  const eventRiskBySessionId = (() => {
    const rank = { low: 0, medium: 1, high: 2, crisis: 3 };
    const map = {};
    (events || []).forEach(ev => {
      const sid = ev?.sessionId;
      if (!sid) return;
      let r = (ev?.riskLevel || '').toString().toLowerCase();
      if (ev?.type === 'sos') r = 'crisis';
      if (!r) return;
      const curr = map[sid];
      if (!curr || (rank[r] || 0) > (rank[curr] || 0)) {
        map[sid] = r;
      }
    });
    return map;
  })();

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
          const fallback = (rep.riskLevel || rep.riskAssessment?.overallRisk || rep.priority || '').toString().toLowerCase()
          const fromEvents = eventRiskBySessionId[rep.sessionId]
          const risk = (fromEvents || fallback || 'low')
          const riskText = risk.toUpperCase()
          const riskPill = risk === 'crisis' ? 'bg-red-100 text-red-700 border-red-300' :
            risk === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' :
            risk === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
          const cardAccent = risk === 'crisis' ? 'border-red-300' : risk === 'high' ? 'border-orange-300' : risk === 'medium' ? 'border-amber-300' : 'border-emerald-300'
          return (
            <button key={rep.sessionId} onClick={() => openReport(rep.sessionId)}
              className={`text-left bg-white rounded-xl shadow p-4 border ${cardAccent} hover:shadow-md transition`}>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span className="font-mono">Session {rep.sessionId.slice(-8)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${riskPill}`}>{riskText}</span>
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
              <button onClick={()=>setModal(null)} className="w-8 h-8 rounded-full bg-gray-100">✕</button>
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
          </div>
        </div>
      )}
    </div>
  );
}