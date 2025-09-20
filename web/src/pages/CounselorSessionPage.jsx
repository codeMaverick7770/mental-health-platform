import { useEffect, useState } from 'react';

export default function CounselorSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch counselor's assigned sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      setLoading(true);
      const response = await fetch('/api/counselor/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  // Load session details and messages
  async function loadSession(sessionId) {
    try {
      const response = await fetch(`/api/counselor/session/${sessionId}`);
      const data = await response.json();
      setActiveSession(data);
      setMessages(data.messages || []);
      setSessionNotes(data.notes || '');
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  // Send message to user
  async function sendMessage() {
    if (!newMessage.trim() || !activeSession) return;

    try {
      const response = await fetch(`/api/counselor/session/${activeSession.sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newMessage,
          sender: 'counselor',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const newMsg = {
          id: Date.now(),
          message: newMessage,
          sender: 'counselor',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  // Save session notes
  async function saveNotes() {
    if (!activeSession) return;

    try {
      await fetch(`/api/counselor/session/${activeSession.sessionId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: sessionNotes })
      });
      alert('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }

  // Update session status
  async function updateSessionStatus(status) {
    if (!activeSession) return;

    try {
      await fetch(`/api/counselor/session/${activeSession.sessionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      setActiveSession(prev => ({ ...prev, status }));
      fetchSessions(); // Refresh sessions list
      alert(`Session marked as ${status}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Sessions</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Assigned Sessions</h2>
              
              {loading ? (
                <div className="text-center py-4">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No sessions assigned</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div
                      key={session.sessionId}
                      onClick={() => loadSession(session.sessionId)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        activeSession?.sessionId === session.sessionId
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm text-gray-600">
                          Session {session.sessionId.slice(-8)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>User: {session.userName || 'Anonymous'}</div>
                        <div>Scheduled: {new Date(session.scheduledAt).toLocaleString()}</div>
                        {session.duration && <div>Duration: {session.duration} min</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {activeSession ? (
              <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
                {/* Session Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Session {activeSession.sessionId.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        User: {activeSession.userName || 'Anonymous'} • 
                        Status: <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(activeSession.status)}`}>
                          {activeSession.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {activeSession.status === 'scheduled' && (
                        <button
                          onClick={() => updateSessionStatus('active')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Start Session
                        </button>
                      )}
                      {activeSession.status === 'active' && (
                        <button
                          onClick={() => updateSessionStatus('completed')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Complete Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'counselor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            msg.sender === 'counselor'
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="text-sm">{msg.message}</div>
                          <div className={`text-xs mt-1 ${
                            msg.sender === 'counselor' ? 'text-teal-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                {activeSession.status === 'active' && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {/* Session Notes */}
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-2">Session Notes</h4>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Add notes about this session..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={saveNotes}
                    className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">💬</div>
                  <div className="text-lg">Select a session to start counseling</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
