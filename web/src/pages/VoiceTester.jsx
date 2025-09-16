import { useEffect, useRef, useState } from 'react'

export default function VoiceTester(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const synth = window.speechSynthesis
  const recognitionRef = useRef(null)
  const [sessionId, setSessionId] = useState(null)
  const [selectedLocale, setSelectedLocale] = useState('en-IN')
  const [micReady, setMicReady] = useState(false)
  const [logItems, setLogItems] = useState([])
  const [voiceMode, setVoiceMode] = useState('auto')
  const [neuralVoice, setNeuralVoice] = useState('en-IN-NeerjaNeural')
  const textInputRef = useRef(null)

  const log = (text, cls='') => setLogItems(prev => [...prev, { text, cls }])

  async function speak(text){
    return new Promise(resolve => {
      const parts = (text || '').split(/([.!?]\s)/).reduce((arr, part, i, all)=>{
        if (i % 2 === 0) arr.push(part + (all[i+1] || '')); return arr
      }, []).filter(Boolean)
      const voices = synth.getVoices()
      const preferred =
        voices.find(v => /en-IN/i.test(v.lang) && /female|neural|asha|pallavi|isha/i.test(v.name)) ||
        voices.find(v => /female/i.test(v.name) && /en/i.test(v.lang)) ||
        voices.find(v=>/en/i.test(v.lang))
      let index = 0
      const speakNext = () => {
        if (index >= parts.length) return resolve()
        const mode = voiceMode || 'auto'
        if (mode === 'neural') {
          const part = parts[index++]
          fetch('http://127.0.0.1:5002/speak', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: part, voice: neuralVoice || 'en-IN-NeerjaNeural' }) })
            .then(r => r.arrayBuffer())
            .then(buf => {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              ctx.decodeAudioData(buf, (audio) => {
                const src = ctx.createBufferSource()
                src.buffer = audio; src.connect(ctx.destination); src.onended = () => setTimeout(speakNext,80); src.start(0)
              })
            })
            .catch(() => resolve())
        } else if (preferred && mode !== 'neural') {
          const utter = new SpeechSynthesisUtterance(parts[index++])
          utter.voice = preferred
          utter.rate = 0.95
          utter.pitch = 1.08
          utter.volume = 1.0
          utter.onend = () => setTimeout(speakNext, 80)
          synth.speak(utter)
        } else {
          const part = parts[index++]
          fetch('http://127.0.0.1:5002/speak', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: part, voice: neuralVoice || 'en-IN-NeerjaNeural' }) })
            .then(r => r.arrayBuffer())
            .then(buf => {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              ctx.decodeAudioData(buf, (audio) => {
                const src = ctx.createBufferSource()
                src.buffer = audio; src.connect(ctx.destination); src.onended = () => setTimeout(speakNext,80); src.start(0)
              })
            })
            .catch(() => resolve())
        }
      }
      speakNext()
    })
  }

  async function speakServer(text, tts){
    try {
      const payload = {
        text,
        style: tts?.style,
        voice: tts?.voice || 'en-IN-NeerjaNeural',
        hindiVoice: tts?.hindiVoice || 'hi-IN-SwaraNeural',
        urduVoice: 'ur-PK-UzmaNeural',
        punjabiVoice: 'pa-IN-GaganNeural'
      }
      const ttsResp = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!ttsResp.ok) throw new Error('tts proxy failed')
      const buf = await ttsResp.arrayBuffer()
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const audio = await ctx.decodeAudioData(buf.slice(0))
      const src = ctx.createBufferSource()
      src.buffer = audio; src.connect(ctx.destination); src.start(0)
      await new Promise(res => { src.onended = res })
    } catch(e) {
      await speak(text)
    }
  }

  useEffect(() => {
    // Preload voices; some browsers need this listener set
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {}
    }
  }, [])

  async function ensureMic(){
    if (micReady) return true
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        log('Mic API not available in this browser. Please use Chrome/Edge.', 'user')
        return false
      }
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicReady(true)
      return true
    } catch(e) {
      log('Mic permission denied. Allow microphone from the address bar.', 'user')
      return false
    }
  }

  async function startSession(){
    const ok = await ensureMic()
    if (!ok) return
    const startResp = await fetch('/api/session/start', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ locale: selectedLocale }) })
    const data = await startResp.json()
    setSessionId(data.sessionId)
    log('Session started: ' + data.sessionId)
    await speak("Hello, I am here with you. When you're ready, press talk and share what's on your mind.")
  }

  async function handleTalk(){
    if (!SpeechRecognition) { alert('SpeechRecognition not supported'); return }
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition()
      const langMap = { 'en-IN':'en-IN','hi-IN':'hi-IN','doi-IN':'hi-IN','ks-IN':'ur-PK','ur-PK':'ur-PK','pa-IN':'pa-IN' }
      rec.lang = langMap[selectedLocale] || 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onresult = async (e) => {
        const text = e.results[0][0].transcript
        log('You: ' + text, 'user')
        const turnResp = await fetch('/api/session/turn', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId, userText: text }) })
        const data = await turnResp.json()
        log('Assistant: ' + data.reply, 'bot')
        if (data.tts) { await speakServer(data.reply, data.tts) } else { await speak(data.reply) }
        if (data.actionPlan) { log('Action plan: ' + JSON.stringify(data.actionPlan), 'bot') }
      }
      rec.onerror = (e) => {
        const err = e.error || 'unknown'
        if (err === 'network') {
          log('Mic error: network. Tip: If using Brave, disable Shields for localhost or use Chrome.', 'user')
        } else if (err === 'not-allowed' || err === 'service-not-allowed') {
          log('Mic blocked. Allow microphone from the address bar.', 'user')
        } else if (err === 'no-speech') {
          log('No speech detected. Please try again closer to the mic.', 'user')
        } else {
          log('Mic error: ' + err, 'user')
        }
      }
      rec.onnomatch = () => { log('Did not catch that. Please try again.', 'user') }
      recognitionRef.current = rec
    }
    recognitionRef.current.start()
  }

  async function sendText(){
    const text = (textInputRef.current?.value || '').trim()
    if (!text) return
    log('You: ' + text, 'user')
    textInputRef.current.value = ''
    const resp = await fetch('/api/session/turn', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId, userText: text }) })
    const data = await resp.json()
    log('Assistant: ' + data.reply, 'bot')
    if (data.tts) { await speakServer(data.reply, data.tts) } else { await speak(data.reply) }
    if (data.actionPlan) { log('Action plan: ' + JSON.stringify(data.actionPlan), 'bot') }
  }

  async function endSession(){
    if (!sessionId) return
    const endResp = await fetch('/api/session/end', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId }) })
    const data = await endResp.json()
    const w = window.open('', '_blank')
    w.document.write(data.report.html)
    w.document.close()
    log('Session ended. Report opened in new tab.')
    setSessionId(null)
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Voice Assistant Tester</h1>

      <div className="flex flex-wrap items-center gap-2">
        <button className="px-3 py-2 rounded bg-teal-600 text-white" onClick={startSession}>Start Session</button>
        <button className="px-3 py-2 rounded bg-gray-900 text-white disabled:opacity-50" disabled={!sessionId} onClick={handleTalk}>Push to Talk</button>
        <button className="px-3 py-2 rounded bg-rose-600 text-white disabled:opacity-50" disabled={!sessionId} onClick={endSession}>End Session</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Language:</label>
        <select className="border rounded px-2 py-1" value={selectedLocale} onChange={e=>setSelectedLocale(e.target.value)}>
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">Hindi</option>
          <option value="doi-IN">Dogri (maps to Hindi)</option>
          <option value="ks-IN">Kashmiri (maps to Urdu)</option>
          <option value="ur-PK">Urdu</option>
          <option value="pa-IN">Punjabi</option>
        </select>

        <label className="text-sm">Voice mode:</label>
        <select className="border rounded px-2 py-1" value={voiceMode} onChange={e=>setVoiceMode(e.target.value)}>
          <option value="auto">Auto (prefer local en-IN)</option>
          <option value="local">Local only</option>
          <option value="neural">Neural (Python TTS)</option>
        </select>

        <label className="text-sm">Neural voice:</label>
        <input className="border rounded px-2 py-1 w-56" value={neuralVoice} onChange={e=>setNeuralVoice(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <input ref={textInputRef} className="flex-1 border rounded px-3 py-2" placeholder="Type here if mic fails" disabled={!sessionId} />
        <button className="px-3 py-2 rounded bg-gray-800 text-white disabled:opacity-50" disabled={!sessionId} onClick={sendText}>Send</button>
      </div>

      <div className="border rounded p-3 h-72 overflow-auto">
        {logItems.map((it, i) => (
          <div key={i} className={it.cls === 'bot' ? 'text-emerald-700' : it.cls === 'user' ? 'text-gray-900' : 'text-gray-600'}>{it.text}</div>
        ))}
      </div>
    </div>
  )
}


