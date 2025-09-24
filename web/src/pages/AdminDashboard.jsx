import { useEffect, useMemo, useState } from 'react';
import {
  Users as FiUsers,
  Activity as FiActivity,
  AlertTriangle as FiAlertTriangle,
  Clock as FiClock,
  TrendingUp as FiTrendingUp,
  BarChart3 as FiBarChart3,
  Heart as FiHeart,
  MessageSquare as FiMessageSquare,
  Shield as FiShield,
  Zap as FiZap,
  Eye as FiEye
} from 'lucide-react';

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-full -translate-y-10 translate-x-10 opacity-60"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-600">{label}</div>
          {Icon && <Icon className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />}
        </div>
        <div className="text-3xl font-bold tracking-tight">
        <span className={accent}>{value}</span>
        </div>
      </div>
    </div>
  );
}

function BarMini({ value, max = 1 }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
      <div 
        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${pct}%` }} 
      />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Mental Health Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Real-time insights and monitoring</p>
            {overview?.insightsSource && (
              <div className="mt-2 inline-flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                  Insights source: <strong className="ml-1">{overview.insightsSource}</strong>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 self-center md:self-auto">
            <button
              onClick={refresh}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow hover:shadow-md hover:brightness-105 active:scale-[.99] transition"
              title="Refresh dashboard now"
            >Refresh</button>
            <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
          </div>
        </div>

        {/* Stats Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Sessions" 
            value={overview?.totalSessions || 0} 
            accent="text-teal-600" 
            icon={FiUsers}
          />
          <StatCard 
            label="Active Users" 
            value={overview?.activeUsers || 0} 
            accent="text-emerald-600" 
            icon={FiActivity}
          />
          <StatCard 
            label="Crisis Interventions" 
            value={overview?.crisisInterventions || 0} 
            accent="text-red-600" 
            icon={FiAlertTriangle}
          />
          <StatCard 
            label="Avg Duration (min)" 
            value={overview?.averageSessionDuration || 0} 
            accent="text-indigo-600" 
            icon={FiClock}
          />
      </section>

        {/* Risk Distribution & Heatmap */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
                <FiBarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Risk Distribution</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(risk).map(([k, v]) => {
                const riskColors = {
                  low: 'text-emerald-600',
                  medium: 'text-amber-600', 
                  high: 'text-orange-600',
                  crisis: 'text-red-600'
                };
                return (
                  <div key={k} className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`capitalize font-semibold ${riskColors[k] || 'text-gray-600'}`}>{k}</span>
                      <span className="font-bold text-lg">{v}</span>
                </div>
                <BarMini value={v} max={riskMax} />
              </div>
                );
              })}
          </div>
        </div>

          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">28-Day Activity Heatmap</h2>
            </div>
            <div className="grid grid-cols-14 gap-1.5">
            {heatmap.map((d, i) => {
              const high = (d.high || 0) + (d.crisis || 0);
              const medium = d.medium || 0;
              const total = d.total || 0;
                const color = total === 0 ? 'bg-gray-100' : 
                  high > 0 ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-sm' : 
                  medium > 0 ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm' : 
                  'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm';
                return (
                  <div 
                    key={i} 
                    className={`w-5 h-5 rounded-lg ${color} hover:scale-110 transition-transform cursor-pointer`} 
                    title={`${d.date}: total ${total}, H:${d.high}/C:${d.crisis}`} 
                  />
                );
            })}
          </div>
        </div>
      </section>

        {/* Common Issues & Stress Trend */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl">
                <FiAlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Common Issues</h2>
            </div>
            <div className="space-y-3">
              {(commonIssues || []).slice(0, 5).map(([issue, count], idx) => (
                <div key={issue} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 hover:from-teal-50 hover:to-emerald-50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      idx === 0 ? 'bg-red-500' :
                      idx === 1 ? 'bg-orange-500' :
                      idx === 2 ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="font-medium text-gray-700">{issue}</span>
                  </div>
                  <span className="font-bold text-lg text-gray-800 bg-white px-3 py-1 rounded-full shadow-sm">{count}</span>
                </div>
              ))}
              {(!commonIssues || commonIssues.length === 0) && (
                <div className="text-center text-gray-500 py-8">No data available</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Stress Trend</h2>
            </div>
            <div className="h-32 flex items-end justify-center gap-1 bg-gradient-to-t from-gray-50 to-transparent rounded-2xl p-4">
              {(stressTrend || []).map((s, i) => {
                const max = Math.max(1, ...stressTrend.map(x => x.avg || 0));
                const h = Math.round(((s.avg || 0) / max) * 100);
                return (
                  <div 
                    key={i} 
                    className="w-3 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t-lg hover:from-teal-600 hover:to-emerald-500 transition-colors cursor-pointer shadow-sm" 
                    style={{ height: `${h}%` }} 
                    title={`${s.date}: ${s.avg}`} 
                  />
                );
              })}
              {(!stressTrend || stressTrend.length === 0) && (
                <div className="text-center text-gray-500 py-8">No data available</div>
              )}
            </div>
          </div>
        </section>

        {/* Analytics Grid */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <FiHeart className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-800">Emotional Patterns</h2>
            </div>
            <div className="space-y-3 text-sm">
              {(emotionalPatterns || []).slice(0, 5).map(([pattern, count]) => (
                <div key={pattern} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 hover:from-pink-50 hover:to-pink-100 transition-all duration-200">
                  <span className="font-medium text-gray-700">{pattern}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
              {(!emotionalPatterns || emotionalPatterns.length === 0) && <div className="text-center text-gray-500 py-8">No data available</div>}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <FiMessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Main Topics</h2>
            </div>
            <div className="space-y-3 text-sm">
              {(mainTopics || []).slice(0, 5).map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                  <span className="font-medium text-gray-700">{topic}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
              {(!mainTopics || mainTopics.length === 0) && <div className="text-center text-gray-500 py-8">No data available</div>}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <FiShield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Coping Strategies</h2>
              </div>
            <div className="space-y-3 text-sm">
              {(copingStrategies || []).slice(0, 5).map(([strategy, count]) => (
                <div key={strategy} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 hover:from-green-50 hover:to-green-100 transition-all duration-200">
                  <span className="font-medium text-gray-700">{strategy}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
            </div>
          ))}
              {(!copingStrategies || copingStrategies.length === 0) && <div className="text-center text-gray-500 py-8">No data available</div>}
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FiEye className="w-6 h-6 text-teal-600" />
            Recent Sessions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sessions.map(s => {
              const flags = Array.isArray(s.riskFlags) ? s.riskFlags : [];
              const levelFromFlags = (() => {
                const hasCrisis = flags.some(f => (f.level || '').toString().toLowerCase() === 'crisis');
                const hasHigh = flags.some(f => (f.level || '').toString().toLowerCase() === 'high');
                const hasMedium = flags.some(f => (f.level || '').toString().toLowerCase() === 'medium');
                if (hasCrisis) return 'crisis';
                if (hasHigh) return 'high';
                if (hasMedium) return 'medium';
                return null;
              })();
              const fallbackLevel = (s.riskLevel || s.priority || s.riskAssessment?.overallRisk || '').toString().toLowerCase();
              const fromEvents = eventRiskBySessionId[s.id];
              const risk = levelFromFlags || fromEvents || fallbackLevel || 'low';
              const norm = risk === 'crisis' ? 'crisis' : risk === 'high' ? 'high' : risk === 'medium' ? 'medium' : 'low';
              const riskText = norm.toUpperCase();
              const riskPill = norm === 'crisis' ? 'bg-red-100 text-red-700 border-red-300' :
                norm === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                norm === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300';
              const cardAccent = norm === 'crisis' ? 'border-red-300' : norm === 'high' ? 'border-orange-300' : norm === 'medium' ? 'border-amber-300' : 'border-emerald-300';
              return (
                <div key={s.id} className={`border ${cardAccent} rounded-2xl p-4 text-sm bg-white shadow-sm hover:shadow-md transition-shadow duration-300`}>
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="font-mono">{s.id?.slice(-8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${riskPill}`}>{riskText}</span>
                  </div>
                  <div className="mt-1 text-gray-600">{new Date(s.startedAt).toLocaleString()}</div>
                  <div className="mt-1 font-medium text-gray-700">Turns: {s.turns?.length || 0}</div>
                </div>
              );
            })}
        </div>
      </section>

        {/* Realtime Events */}
        <section className="rounded-3xl bg-white shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <FiZap className="w-6 h-6 text-yellow-500" />
            Realtime Events
          </h2>
          <ul className="space-y-3 text-sm max-h-60 overflow-y-auto">
          {events.slice(-10).reverse().map((ev, i) => (
              <li key={i} className="hover:bg-yellow-50 rounded px-3 py-1 transition-colors cursor-default">
                {ev.type === 'sos'
              ? `🚨 SOS • Session ${String(ev.sessionId || '').slice(-8)} • ${ev.message}`
                  : `Insight • Session ${String(ev.sessionId || '').slice(-8)} • Risk ${ev.riskLevel?.toUpperCase?.()}`}
              </li>
          ))}
        </ul>
      </section>
      </div>
    </div>
  );
}
