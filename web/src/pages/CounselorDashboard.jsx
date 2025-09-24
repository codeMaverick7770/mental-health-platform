import { useEffect, useState } from 'react';
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
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, activeToday: 0 });
  const [events, setEvents] = useState([]);

  async function refresh() {
    try {
      const r = await fetch('/api/counselor/reports?limit=50')
        .then(r => r.json());
      setReports(r.reports || []);
      // also get latest realtime alerts/insights to reflect highest risk like admin dashboard
      const a = await fetch('/api/admin/alerts').then(r=>r.json());
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
    } catch (e) {
      // Mock data for standalone functionality
      setReports(mockReports);
      setEvents(mockEvents);
      const list = mockReports;
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
  }
  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-8 text-center sm:text-left tracking-tight shadow-lg drop-shadow-sm">Counselor Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 shadow-lg p-6 border border-indigo-200 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <BarChart3 className="w-8 h-8 text-indigo-700" />
              </div>
              <div className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-2">Total Sessions</div>
              <div className="text-3xl font-black text-indigo-800">{stats.total}</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-red-50 via-rose-50 to-red-100 shadow-lg p-6 border border-red-200 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-200 to-rose-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <OctagonAlert className="w-8 h-8 text-red-700" />
              </div>
              <div className="text-sm font-medium text-red-600 uppercase tracking-wide mb-2">Critical Cases</div>
              <div className="text-3xl font-black text-red-700">{stats.critical}</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 shadow-lg p-6 border border-orange-200 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-200 to-amber-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-orange-700" />
              </div>
              <div className="text-sm font-medium text-orange-600 uppercase tracking-wide mb-2">High Priority</div>
              <div className="text-3xl font-black text-orange-700">{stats.high}</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 shadow-lg p-6 border border-emerald-200 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <CalendarDays className="w-8 h-8 text-emerald-700" />
              </div>
              <div className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-2">Active Today</div>
              <div className="text-3xl font-black text-emerald-700">{stats.activeToday}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8 justify-center sm:justify-start">
            {['all', 'critical', 'high', 'medium', 'low'].map(p => (
              <button 
                key={p} 
                onClick={() => setFilter(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border-2 shadow-sm ${filter === p 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-teal-500 shadow-lg shadow-teal-200/50 transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:scale-105'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shown.map(rep => {
              const fallback = (rep.riskLevel || rep.riskAssessment?.overallRisk || rep.priority || '').toString().toLowerCase();
              const fromEvents = eventRiskBySessionId[rep.sessionId];
              const risk = (fromEvents || fallback || 'low');
              const riskText = risk.toUpperCase();
              const riskPill = risk === 'crisis' ? 'bg-red-100 text-red-700 border-red-300 shadow-red-200/50' :
                risk === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-orange-200/50' :
                risk === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-amber-200/50' : 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-emerald-200/50';
              const cardAccent = risk === 'crisis' ? 'border-l-red-500' : risk === 'high' ? 'border-l-orange-500' : risk === 'medium' ? 'border-l-amber-500' : 'border-l-emerald-500';
              return (
                <button 
                  key={rep.sessionId} 
                  onClick={() => openReport(rep.sessionId)}
                  className={`group cursor-pointer text-left bg-white rounded-2xl shadow-lg p-6 border ${cardAccent} hover:shadow-xl hover:${cardAccent === 'border-l-red-500' ? 'border-l-red-600' : cardAccent === 'border-l-orange-500' ? 'border-l-orange-600' : cardAccent === 'border-l-amber-500' ? 'border-l-amber-600' : 'border-l-emerald-600'} transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] overflow-hidden hover:shadow-2xl`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                        <UserIcon className="w-5 h-5 text-gray-700" />
                      </div>

                      <div>
                        <div className="font-bold text-gray-900 text-lg leading-tight">Session {rep.sessionId.slice(-8)}</div>
                        <div className="text-sm text-gray-500">Started {new Date(rep.startedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm group-hover:brightness-110 transition-all ${riskPill}`}>{riskText}</span>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex flex-wrap items-center gap-6 text-sm divide-x divide-gray-200">
                      <div className="flex items-center gap-2 pr-6">
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                        <span>Messages: <span className="font-semibold text-indigo-700">{rep.studentInfo?.messageCount || 0}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-green-600" />
                        <span>Duration: <span className="font-semibold text-green-700">{rep.studentInfo?.sessionDuration || 0} min</span></span>
                      </div>

                    </div>
                    {rep.immediateActions?.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-inner">
                        <div className="font-semibold text-amber-800 mb-3 flex items-center gap-2 text-base">⚡ Immediate Actions ({rep.immediateActions.length})</div>
                        <ul className="space-y-2 ml-6 text-sm">
                          {rep.immediateActions.slice(0,2).map((a,i) => (
                            <li key={i} className="list-disc text-amber-700 leading-relaxed">{a.action}</li>
                          ))}
                          {rep.immediateActions.length > 2 && <li className="list-none text-gray-500 font-medium">... and {rep.immediateActions.length - 2} more</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {modal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={() => setModal(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 rounded-t-3xl shadow-xl z-10 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold leading-tight">Detailed Counselor Report</h2>
                  <p className="text-teal-100 mt-1 font-medium">Session ID: {modal.sessionId.slice(-8)}</p>
                </div>
                <button 
                  onClick={() => setModal(null)} 
                  className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

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

              {modal.immediateActions?.length > 0 && (
                <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 border border-amber-200 shadow-lg">
                  <h3 className="font-bold text-xl text-amber-800 mb-6 flex items-center gap-2"><Zap className="w-5 h-5" /> Immediate Actions Required</h3>

                  <div className="space-y-4">
                    {modal.immediateActions.map((a, i) => (
                      <div 
                        key={i} 
                        className={`rounded-xl p-5 border-l-4 shadow-md transition-all hover:shadow-lg ${
                          a.priority === 'CRITICAL' ? 'bg-red-50 border-l-red-500' : 
                          a.priority === 'HIGH' ? 'bg-orange-50 border-l-orange-500' : 
                          'bg-emerald-50 border-l-emerald-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-semibold text-lg capitalize text-gray-800 leading-tight">{a.priority || 'Medium'}</div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                            a.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' : 
                            a.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {a.priority}
                          </span>
                        </div>
                        <div className="text-gray-800 font-medium mb-2 text-base leading-relaxed">{a.action}</div>
                        {a.details && <div className="text-sm text-gray-600 italic mb-3 bg-white/50 px-3 py-2 rounded-lg border border-gray-200">Details: {a.details}</div>}
                        {a.timeline && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                            <Clock className="w-4 h-4 text-red-600" />
                            Timeline: <span className="ml-1">{a.timeline}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}