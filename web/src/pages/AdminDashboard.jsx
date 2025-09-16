import { useEffect, useMemo, useState } from 'react';

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white shadow p-5 border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">
        <span className={accent}>{value}</span>
      </div>
    </div>
  );
}

function BarMini({ value, max = 1 }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
      <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [risk, setRisk] = useState({});
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [commonIssues, setCommonIssues] = useState([]);
  const [emotionalPatterns, setEmotionalPatterns] = useState([]);
  const [mainTopics, setMainTopics] = useState([]);
  const [copingStrategies, setCopingStrategies] = useState([]);
  const [stressTrend, setStressTrend] = useState([]);

  async function refresh() {
    const [d, s, a] = await Promise.all([
      fetch('/api/admin/dashboard').then(r => r.json()).catch(() => null),
      fetch('/api/admin/sessions?limit=20').then(r => r.json()).catch(() => ({ sessions: [] })),
      fetch('/api/admin/alerts').then(r => r.json()).catch(() => ({ alerts: [], realtime: [] })),
    ]);
    setOverview(d?.overview || null);
    setRisk(d?.riskDistribution || {});
    setHeatmap(d?.heatmap || []);
    setCommonIssues(d?.commonIssues || []);
    setEmotionalPatterns(d?.emotionalPatterns || []);
    setMainTopics(d?.mainTopics || []);
    setCopingStrategies(d?.copingStrategies || []);
    setStressTrend(d?.stressTrend || []);
    setSessions(s?.sessions || []);
    setEvents(a?.realtime || []);
  }
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  const riskMax = useMemo(() => {
    const vals = Object.values(risk);
    return vals.length ? Math.max(...vals) : 1;
  }, [risk]);

  const eventRiskBySessionId = useMemo(() => {
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
  }, [events]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Admin Dashboard</h1>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={overview?.totalSessions || 0} accent="text-teal-600" />
        <StatCard label="Active Users" value={overview?.activeUsers || 0} accent="text-teal-600" />
        <StatCard label="Crisis Interventions" value={overview?.crisisInterventions || 0} accent="text-red-600" />
        <StatCard label="Avg Duration (min)" value={overview?.averageSessionDuration || 0} accent="text-gray-900" />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100 hover:shadow-lg transition">
          <h2 className="font-semibold mb-3">Risk distribution</h2>
          <div className="space-y-3">
            {Object.entries(risk).map(([k, v]) => (
              <div key={k} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="capitalize">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
                <BarMini value={v} max={riskMax} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100 hover:shadow-lg transition">
          <h2 className="font-semibold mb-3">28‑day Heatmap</h2>
          <div className="grid grid-cols-14 gap-1">
            {heatmap.map((d, i) => {
              const high = (d.high || 0) + (d.crisis || 0);
              const medium = d.medium || 0;
              const total = d.total || 0;
              const color = total === 0 ? 'bg-gray-100' : high > 0 ? 'bg-red-300' : medium > 0 ? 'bg-amber-300' : 'bg-emerald-300';
              return <div key={i} className={`w-4 h-4 rounded ${color}`} title={`${d.date}: total ${total}, H:${d.high}/C:${d.crisis}`} />;
            })}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100 hover:shadow-lg transition">
          <h2 className="font-semibold mb-3">Common Issues</h2>
          <div className="space-y-2 text-sm">
            {(commonIssues || []).slice(0, 5).map(([issue, count]) => (
              <div key={issue} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span>{issue}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {(!commonIssues || commonIssues.length === 0) && <div className="text-gray-500">No data</div>}
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100 hover:shadow-lg transition">
          <h2 className="font-semibold mb-3">Stress Trend (weighted risk)</h2>
          <div className="h-28 flex items-end gap-1">
            {(stressTrend || []).map((s, i) => {
              const max = Math.max(1, ...stressTrend.map(x => x.avg || 0));
              const h = Math.round(((s.avg || 0) / max) * 100);
              return <div key={i} className="w-2 bg-teal-500" style={{ height: `${h}%` }} title={`${s.date}: ${s.avg}`} />;
            })}
            {(!stressTrend || stressTrend.length === 0) && <div className="text-gray-500">No data</div>}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100 hover:shadow-lg transition">
          <h2 className="font-semibold mb-3">Emotional Patterns</h2>
          <div className="space-y-2 text-sm">
            {(emotionalPatterns || []).slice(0, 5).map(([pattern, count]) => (
              <div key={pattern} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span>{pattern}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {(!emotionalPatterns || emotionalPatterns.length === 0) && <div className="text-gray-500">No data</div>}
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100 hover:shadow-lg transition">
          <h2 className="font-semibold mb-3">Main Topics</h2>
          <div className="space-y-2 text-sm">
            {(mainTopics || []).slice(0, 5).map(([topic, count]) => (
              <div key={topic} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span>{topic}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {(!mainTopics || mainTopics.length === 0) && <div className="text-gray-500">No data</div>}
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow p-5 border border-gray-100">
          <h2 className="font-semibold mb-3">Coping Strategies</h2>
          <div className="space-y-2 text-sm">
            {(copingStrategies || []).slice(0, 5).map(([strategy, count]) => (
              <div key={strategy} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span>{strategy}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {(!copingStrategies || copingStrategies.length === 0) && <div className="text-gray-500">No data</div>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow p-5 border border-gray-100">
        <h2 className="font-semibold mb-3">Recent sessions</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {sessions.map(s => {
            // derive risk across multiple potential shapes
            const flags = Array.isArray(s.riskFlags) ? s.riskFlags : []
            const levelFromFlags = (() => {
              const hasCrisis = flags.some(f => (f.level || '').toString().toLowerCase() === 'crisis')
              const hasHigh = flags.some(f => (f.level || '').toString().toLowerCase() === 'high')
              const hasMedium = flags.some(f => (f.level || '').toString().toLowerCase() === 'medium')
              if (hasCrisis) return 'crisis'
              if (hasHigh) return 'high'
              if (hasMedium) return 'medium'
              return null
            })()
            const fallbackLevel = (s.riskLevel || s.priority || s.riskAssessment?.overallRisk || '').toString().toLowerCase()
            const fromEvents = eventRiskBySessionId[s.id]
            const risk = levelFromFlags || fromEvents || fallbackLevel || 'low'
            const norm = risk === 'crisis' ? 'crisis' : risk === 'high' ? 'high' : risk === 'medium' ? 'medium' : 'low'
            const riskText = norm.toUpperCase()
            const riskPill = norm === 'crisis' ? 'bg-red-100 text-red-700 border-red-300' :
              norm === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' :
              norm === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
            const cardAccent = norm === 'crisis' ? 'border-red-300' : norm === 'high' ? 'border-orange-300' : norm === 'medium' ? 'border-amber-300' : 'border-emerald-300'
            return (
              <div key={s.id} className={`border ${cardAccent} rounded-xl p-3 text-sm`}>
                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-mono">{s.id?.slice(-8)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${riskPill}`}>{riskText}</span>
                </div>
                <div className="mt-1 text-gray-500">{new Date(s.startedAt).toLocaleString()}</div>
                <div className="mt-1">Turns: {s.turns?.length || 0}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow p-5 border border-gray-100">
        <h2 className="font-semibold mb-3">Realtime</h2>
        <ul className="space-y-2 text-sm">
          {events.slice(-10).reverse().map((ev, i) => (
            <li key={i}>{ev.type === 'sos'
              ? `🚨 SOS • Session ${String(ev.sessionId || '').slice(-8)} • ${ev.message}`
              : `Insight • Session ${String(ev.sessionId || '').slice(-8)} • Risk ${ev.riskLevel?.toUpperCase?.()}`}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}