# Mental Health Platform

A comprehensive mental health support platform featuring a voice assistant with AI-powered counseling capabilities, text-to-speech synthesis, and session reporting.

## 🚀 Features

- **Voice Assistant**: Interactive voice-based mental health support with speech recognition
- **AI Counseling**: Powered by Qwen2.5:3b LLM for empathetic responses
- **Text-to-Speech**: Multiple TTS options including Azure Neural TTS and edge-tts
- **Safety Detection**: Risk assessment and crisis intervention capabilities
- **Session Reporting**: Detailed analytics and sentiment tracking
- **Multi-language Support**: English and Hindi language support
- **Web Interface**: User-friendly testing interface

## 🏗️ Architecture

The platform consists of three main components:

1. **Voice Assistant Server** (Node.js) - Port 3000
   - Session management
   - AI dialogue processing
   - Safety risk detection
   - Report generation

2. **TTS Server** (Python FastAPI) - Port 5002
   - Azure Neural TTS integration
   - edge-tts fallback
   - Multi-language voice synthesis

3. **Client Interface** (React Native)
   - Mobile application interface
   - Voice interaction UI

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mental-health-platform
   ```

2. **Install Voice Assistant Dependencies**
   ```bash
   cd voiceAssistant
   npm install
   ```

3. **Install TTS Server Dependencies**
   ```bash
   cd voiceAssistant
   pip install fastapi uvicorn edge-tts azure-cognitiveservices-speech
   ```

4. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

5. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `voiceAssistant` directory:

```env
# LLM Configuration
USE_LLM=1
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

# Azure Speech Services (Optional - will fallback to edge-tts if not set)
SPEECH_KEY=your_azure_speech_key
SPEECH_REGION=your_azure_region
```

### Running the Application

#### Option 1: Run All Services (Recommended)
```bash
npm run dev
```

#### Option 2: Run Services Individually

1. **Start Voice Assistant Server**
   ```bash
   cd voiceAssistant
   node server.js
   ```

2. **Start TTS Server**
   ```bash
   cd voiceAssistant
   python tts_server.py
   ```

3. **Start Client**
   ```bash
   cd client
   npm run dev
   ```

4. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

### Access Points

- **Voice Assistant Web Interface**: http://localhost:3000
- **TTS Server API**: http://localhost:5002
- **Client Application**: http://localhost:3001 (or as configured)
- **Backend API**: http://localhost:8000 (or as configured)

## 🧪 Testing

### Voice Assistant Testing
1. Open http://localhost:3000 in your browser
2. Click "Start Session"
3. Allow microphone permissions
4. Use "Push to Talk" or type in the text input
5. Test different voice modes (Auto, Local, Neural)

### API Testing
```bash
# Test Voice Assistant Health
curl http://localhost:3000/api/llm/health

# Test TTS Server
curl http://localhost:5002/voices

# Test TTS Synthesis
curl -X POST http://localhost:5002/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test."}'
```

## 🔧 Configuration

### Voice Settings
- **Default English Voice**: en-IN-NeerjaNeural
- **Default Hindi Voice**: hi-IN-SwaraNeural
- **Voice Modes**: Auto (prefer local), Local only, Neural (Python TTS)

### Safety Features
- Crisis keyword detection
- Risk level assessment (high/medium)
- Automatic safety responses
- Session risk flagging

### LLM Integration
- Model: Qwen2.5:3b (3.1B parameters)
- Temperature: 0.72
- Context window: 2048 tokens
- Fallback to rule-based responses if LLM unavailable

## 📊 Session Analytics

The platform generates detailed session reports including:
- Sentiment analysis over time
- Key topics discussed
- Coping strategies suggested
- Risk flags detected
- Session duration and timing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all services start without errors
- Test voice functionality across different browsers

## 📝 API Documentation

### Voice Assistant API

#### POST /api/session/start
Start a new counseling session
```json
{
  "locale": "en-IN"
}
```

#### POST /api/session/turn
Process user input and get AI response
```json
{
  "sessionId": "session-id",
  "userText": "I'm feeling anxious about exams"
}
```

#### POST /api/session/end
End session and generate report
```json
{
  "sessionId": "session-id"
}
```

### TTS API

#### POST /speak
Generate speech from text
```json
{
  "text": "Hello, how are you?",
  "voice": "en-IN-NeerjaNeural",
  "pace": 0.95,
  "semitones": 0.5
}
```

#### GET /voices
Get available voices list

## 🚨 Safety and Privacy

- All conversations are processed locally when possible
- No data is stored permanently without user consent
- Crisis detection triggers appropriate safety responses
- Session reports are generated locally and can be saved privately

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section in the documentation
- Review the API documentation for integration help

## 🔮 Roadmap

- [ ] Mobile app improvements
- [ ] Additional language support
- [ ] Advanced analytics dashboard
- [ ] Integration with external counseling services
- [ ] Offline mode capabilities
- [ ] Voice emotion detection
- [ ] Group session support
