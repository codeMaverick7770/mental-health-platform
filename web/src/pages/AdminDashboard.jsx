import React, { useEffect, useMemo, useState } from 'react';
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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 cursor-pointer">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-full -translate-y-10 translate-x-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-gray-700 tracking-wide">{label}</div>
          {Icon && <Icon className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition-all duration-300 transform group-hover:scale-110" />}
        </div>
        <div className="text-4xl font-black tracking-tight leading-tight">
          <span className={accent}>{value}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [risk, setRisk] = useState({
    low: 0,
    medium: 0,
    high: 0,
    crisis: 0
  });
  const [heatmap, setHeatmap] = useState([]);
  const [commonIssues, setCommonIssues] = useState([]);
  const [emotionalPatterns, setEmotionalPatterns] = useState([]);
  const [mainTopics, setMainTopics] = useState([]);
  const [copingStrategies, setCopingStrategies] = useState([]);
  const [stressTrend, setStressTrend] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);

  // Always use mock for self-contained demo
  const USE_MOCK = true;

  async function refresh() {
    // Enhanced mock data with realistic values and structures for charts
    setOverview({
      totalSessions: 1247,
      activeUsers: 342,
      crisisInterventions: 23,
      averageSessionDuration: 24.5,
      insightsSource: 'Simulated Analytics'
    });

    setRisk({
      low: 856,
      medium: 312,
      high: 67,
      crisis: 12
    });

    // 30-day heatmap data
    const now = new Date();
    const heatmapData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      heatmapData.push({
        date: dateStr,
        total: Math.floor(Math.random() * 50 + 20),
        medium: Math.floor(Math.random() * 15 + 5),
        high: Math.floor(Math.random() * 8),
        crisis: Math.random() < 0.03 ? 1 : 0
      });
    }
    setHeatmap(heatmapData);

    // Metric data as objects for Recharts
    setCommonIssues([
      { name: 'Academic Pressure', value: 285 },
      { name: 'Anxiety & Worry', value: 214 },
      { name: 'Family Conflicts', value: 156 },
      { name: 'Relationship Issues', value: 123 },
      { name: 'Sleep Disturbances', value: 98 },
      { name: 'Low Self-Esteem', value: 76 }
    ]);

    setEmotionalPatterns([
      { name: 'Anxiety', value: 312 },
      { name: 'Sadness', value: 245 },
      { name: 'Stress', value: 456 },
      { name: 'Anger', value: 187 },
      { name: 'Hope/Relief', value: 89 }
    ]);

    setMainTopics([
      { name: 'School & Studies', value: 456 },
      { name: 'Family Dynamics', value: 321 },
      { name: 'Peer Relationships', value: 298 },
      { name: 'Career Worries', value: 234 },
      { name: 'Physical Health', value: 167 }
    ]);

    setCopingStrategies([
      { name: 'Talking to Friends', value: 412 },
      { name: 'Physical Exercise', value: 356 },
      { name: 'Music & Relaxation', value: 289 },
      { name: 'Journaling Thoughts', value: 198 },
      { name: 'Breathing Exercises', value: 145 }
    ]);

    // 30-day stress trend
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000).toLocaleDateString();
      trendData.push({
        date,
        avgStress: Number(((4 + Math.random() * 6) * 10).toFixed(1)),
        sessions: Math.floor(Math.random() * 45 + 15)
      });
    }
    setStressTrend(trendData);

    // 25 mock sessions
    const nowDate = new Date();
    const sessionData = Array.from({ length: 25 }, (_, i) => ({
      id: `session-${String(i + 1).padStart(3, '0')}`,
      startedAt: new Date(nowDate.getTime() - Math.random() * 30 * 86400000),
      turns: Math.floor(Math.random() * 60 + 5),
      riskLevel: ['low', 'medium', 'high', 'crisis'][Math.floor(Math.random() * 4)]
    }));
    setSessions(sessionData);

    // Initial events
    setEvents([
      {
        type: 'sos',
        sessionId: 'session-012',
        message: 'Emergency SOS activated - reports of self-harm ideation',
        riskLevel: 'crisis'
      },
      {
        type: 'insight',
        sessionId: 'session-045',
        message: 'High anxiety patterns detected during exam discussion',
        riskLevel: 'high'
      },
      {
        type: 'insight',
        sessionId: 'session-089',
        message: 'Positive copes strategy shift to exercise mentioned',
        riskLevel: 'medium'
      }
    ]);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Simulate realtime events (add new every 8s, keep last 20)
  useEffect(() => {
    if (!USE_MOCK) return;

    const simInterval = setInterval(() => {
      const newEvent = {
        type: Math.random() > 0.8 ? 'sos' : 'insight',
        sessionId: `session-${Math.floor(Math.random() * 100 + 1).toString().padStart(3, '0')}`,
        message:
          Math.random() > 0.7
            ? 'Reported acute distress - immediate counselor notification recommended'
            : 'Elevated stress indicators in conversation about family issues',
        riskLevel: Math.random() > 0.6 ? 'high' : 'medium'
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 20));
    }, 8000);

    return () => clearInterval(simInterval);
  }, []);

  // Memoized data for charts
  const riskData = useMemo(
    () =>
      Object.entries(risk).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value
      })),
    [risk]
  );

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'];

  const currentTime = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Enhanced Header */}
        <header className="text-center md:text-left space-y-6">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-600 bg-clip-text text-transparent tracking-tight leading-tight">
            Student Wellness Monitor
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto md:mx-0 leading-relaxed">
            Advanced real-time analytics dashboard providing deep insights into student mental health trends, risk assessments, and proactive intervention opportunities for administrators and counselors.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
            <button
              onClick={refresh}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              🔄 Refresh Insights
            </button>
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 shadow-lg">
              <span className="text-sm font-medium text-gray-700">Updated: </span>
              <span className="font-bold text-gray-900">{currentTime}</span>
            </div>
            <div className="text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full border border-emerald-200">
              🌟 LIVE MONITORING • Auto-updates every 30 seconds
            </div>
          </div>
          {overview?.insightsSource && (
            <div className="text-center md:text-left mt-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-800 rounded-full border border-purple-200 text-sm font-medium">
                📊 Data Source: <strong>{overview.insightsSource}</strong>
              </span>
            </div>
          )}
        </header>

        {/* Key Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Sessions" 
            value={(overview?.totalSessions || 0).toLocaleString()} 
            accent="text-emerald-600" 
            icon={FiUsers} 
          />
          <StatCard 
            label="Active Students" 
            value={(overview?.activeUsers || 0).toLocaleString()} 
            accent="text-purple-600" 
            icon={FiActivity} 
          />
          <StatCard 
            label="Urgent Interventions" 
            value={(overview?.crisisInterventions || 0).toLocaleString()} 
            accent="text-red-600" 
            icon={FiAlertTriangle} 
          />
          <StatCard 
            label="Avg Session Duration" 
            value={`${(overview?.averageSessionDuration || 0).toFixed(1)} min`} 
            accent="text-blue-600" 
            icon={FiClock} 
          />
        </section>

        {/* Main 30-Day Trend Chart */}
        <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-800 mb-2 flex items-center gap-3">
                <FiTrendingUp className="w-10 h-10 text-indigo-600" />
                30-Day Activity & Risk Trends
              </h2>
              <p className="text-lg text-gray-600 max-w-md">Comprehensive view of session volume and escalating risk levels over time</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">📈 Total Sessions</span>
              <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">⚠️ Medium Risk</span>
              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold">🚨 High/Crisis</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={heatmap} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="5 5" stroke="#f1f5f9" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} interval={Math.floor(30 / 7)} tickFormatter={(value) => value.slice(5)} />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Date: ${label}`} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={4} activeDot={{ r: 10, style: { fill: '#10B981', opacity: 1 } }} />
              <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={3} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="high" name="High/Crisis" stroke="#EF4444" strokeWidth={4} dot={false} activeDot={{ r: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Risk Pie & Stress Area Dual */}
        <section className="grid lg:grid-cols-2 gap-8">
          {/* Risk Distribution Pie */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-red-100/80 to-yellow-100/80 rounded-2xl border border-red-200/50">
                <FiShield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Current Risk Distribution</h2>
                <p className="text-gray-600">Breakdown of student risk levels across all active sessions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={140}
                  dataKey="value"
                  nameKey="name"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stress Trend Area Chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-purple-100/80 to-pink-100/80 rounded-2xl border border-purple-200/50">
                <FiBarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Daily Stress Level Trends</h2>
                <p className="text-gray-600">Average stress scores (0-10 scale) with session volume overlay</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={stressTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FECDD3" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} interval={Math.floor(30 / 7)} tickFormatter={(value) => value.slice(0, 5)} />
                <YAxis unit=" /10" />
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <Tooltip />
                <Area type="monotone" dataKey="avgStress" stroke="#EC4899" strokeWidth={3} fillOpacity={1} fill="url(#stressGradient)" activeDot={{ r: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Common Issues Bar & Emotional Pie Dual */}
        <section className="grid lg:grid-cols-2 gap-8">
          {/* Common Issues Horizontal Bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-amber-100/80 to-orange-100/80 rounded-2xl border border-amber-200/50">
                <FiAlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Top 6 Reported Issues</h2>
                <p className="text-gray-600">Frequency of mental health concerns from recent sessions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart layout="vertical" data={commonIssues} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12, fill: '#374151' }} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value">
                  {commonIssues.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Emotional Patterns Pie + List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-pink-100/80 to-rose-100/80 rounded-2xl border border-pink-200/50">
                <FiHeart className="w-8 h-8 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Dominant Emotions</h2>
                <p className="text-gray-600">Emotional patterns identified in conversations</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={emotionalPatterns}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  outerRadius={90}
                  innerRadius={40}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label
                >
                  {emotionalPatterns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Quick Interactive List */}
            <div className="grid grid-cols-1 gap-3">
              {emotionalPatterns.slice(0, 4).map((pattern, idx) => (
                <div
                  key={pattern.name}
                  className="group flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white/0 rounded-2xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300"
                >
                  <span className="font-semibold text-gray-800 flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${COLORS[idx % COLORS.length].replace('#', '')}`} /> 
                    {pattern.name}
                  </span>
                  <span className="font-black text-2xl text-gray-900 group-hover:text-indigo-600 transition-colors">{pattern.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Sessions Table */}
        <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <FiEye className="w-8 h-8 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-800">Recent Student Sessions</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-200/50">
              <table className="w-full min-w-[900px] divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Session ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Interaction Depth</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Risk Assessment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.slice(0, 12).map((s) => {
                    const risk = s.riskLevel.toLowerCase();
                    const riskStyles = {
                      crisis: 'bg-red-100 text-red-800 border-red-300',
                      high: 'bg-orange-100 text-orange-800 border-orange-300',
                      medium: 'bg-amber-100 text-amber-800 border-amber-300',
                      low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }[risk] || 'bg-gray-100 text-gray-800 border-gray-300';
                    return (
                      <tr key={s.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">{s.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.startedAt.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.turns} turns</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold border capitalize ${riskStyles}`}>
                            {risk}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => console.log('Opening detailed view for session:', s.id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:from-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
                          >
                            👁️ View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Realtime Events Feed */}
        <section className="bg-gradient-to-br from-yellow-50/95 to-orange-50/95 rounded-3xl shadow-2xl border border-yellow-200/50 p-8">
          <div className="flex items-center gap-3 mb-8">
            <FiZap className="w-8 h-8 text-yellow-600 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800">Live Event Stream</h2>
          </div>
          <p className="text-gray-700 mb-6 text-center md:text-left max-w-2xl">Real-time notifications for critical insights, SOS activations, and session milestones (simulated for demo)</p>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-yellow-300/60 scrollbar-track-transparent scrollbar-thumb-rounded">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiClock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Awaiting real-time activity...</p>
                <p className="text-sm mt-2">Events will appear here as sessions progress.</p>
              </div>
            ) : (
              events.slice(0, 10).map((ev, i) => (
                <div
                  key={i}
                  className="group p-5 rounded-2xl bg-white/80 border-l-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-md border border-gray-200/50 backdrop-blur-sm"
                  style={{
                    borderLeftColor: ev.type === 'sos' ? '#EF4444' : '#F59E0B'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize
                        ${ev.type === 'sos' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ev.type === 'sos' ? '🚨 SOS Alert' : '💡 New Insight'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-1 leading-tight">{ev.message}</p>
                      <p className="text-sm text-gray-600 flex flex-wrap gap-4">
                        <span>Session: <span className="font-mono font-semibold">{ev.sessionId}</span></span>
                        <span>Risk: <span className="capitalize font-semibold text-amber-700">{ev.riskLevel || 'monitoring'}</span></span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 whitespace-nowrap ml-auto">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
