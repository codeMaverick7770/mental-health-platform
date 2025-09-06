from fastapi import FastAPI, Body
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import edge_tts
import random
import os
import azure.cognitiveservices.speech as speechsdk

DEFAULT_VOICE = "en-IN-NeerjaNeural"  # warm Indian female (English)
DEFAULT_HI_VOICE = "hi-IN-SwaraNeural"  # warm Indian female (Hindi)

app = FastAPI(title="Neural TTS Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_lang(segment: str) -> str:
    # Quick heuristic: Devanagari range => 'hi'; otherwise 'en'
    for ch in segment:
        if '\u0900' <= ch <= '\u097F':
            return 'hi'
    # Common Hindi words in Latin script
    hinglish_tokens = {"nahi","ha","haan","achha","theek","vaise","kuch","zyada","kam","kaise","kyun","bahut","thoda","sach","galat","dost","parivaar","padhai","exam","tension"}
    tokens = {t.lower() for t in segment.split()}
    if tokens & hinglish_tokens:
        return 'hi'
    return 'en'


def build_ssml(text: str, en_voice: str, hi_voice: str, base_rate: float, base_semitones: float, style: str | None, role: str | None) -> str:
    # Sentence-level pacing + micro-variations to avoid monotony, with Hindi/English switching
    raw = text.replace("\n", " ")
    # Split on sentence boundaries conservatively
    import re
    sentences = [s.strip() for s in re.split(r"(?<=[.!?。！？])\s+", raw) if s.strip()]
    parts: list[str] = []
    for idx, s in enumerate(sentences):
        # Randomize a little (±4%) rate and (±0.5) semitones
        r = base_rate * (1.0 + random.uniform(-0.04, 0.04))
        st = base_semitones + random.uniform(-0.5, 0.5)
        rate_pct = f"{int((r-1.0)*100)}%"
        pitch_st = f"{st:+.1f}st"
        lang = detect_lang(s)
        vname = hi_voice if lang == 'hi' else en_voice
        lang_code = 'hi-IN' if lang == 'hi' else 'en-IN'
        style_attr = f" style='{style}'" if style else ""
        role_attr = f" role='{role}'" if role else ""
        # voice-scoped express-as + prosody
        parts.append(
            f"<voice name='{vname}' xml:lang='{lang_code}'>"
            f"<mstts:express-as{style_attr}{role_attr}>"
            f"<prosody rate='{rate_pct}' pitch='{pitch_st}'>" + s + "</prosody>"
            f"</mstts:express-as>"
            f"</voice>"
        )
        # Natural pause between sentences
        if idx < len(sentences)-1:
            parts.append("<break time='350ms'/>")

    inner = "".join(parts) or text
    ssml = (
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' "
        "xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-IN'>"
        + inner +
        "</speak>"
    )
    return ssml


@app.post("/speak")
async def speak(payload: dict = Body(...)):
    text: str = (payload.get("text") or "").strip()
    en_voice: str = (payload.get("voice") or DEFAULT_VOICE).strip()
    hi_voice: str = (payload.get("hindiVoice") or DEFAULT_HI_VOICE).strip()
    # base pacing (~0.95 = slightly slower), in multiplicative terms
    base_rate_mult: float = float(payload.get("pace") or 0.95)
    base_semitones: float = float(payload.get("semitones") or 0.5)  # gentle warmth
    style: str | None = payload.get("style") or "empathetic"
    role: str | None = payload.get("role") or "YoungAdultFemale"
    if not text:
        return JSONResponse({"error": "text is required"}, status_code=400)

    # Check if Azure credentials are available
    speech_key = os.environ.get("SPEECH_KEY", "")
    speech_region = os.environ.get("SPEECH_REGION", "")
    
    if speech_key and speech_region:
        # Use Azure Neural TTS
        try:
            ssml = build_ssml(text, en_voice, hi_voice, base_rate_mult, base_semitones, style, role)
            speech_config = speechsdk.SpeechConfig(
                subscription=speech_key,
                region=speech_region
            )
            audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=False)
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config, audio_config=audio_config
            )
            result = synthesizer.speak_ssml_async(ssml).get()
            if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
                return JSONResponse({"error": str(result.reason)}, status_code=500)

            audio_bytes = result.audio_data
            headers = {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-store",
                "X-Voice": en_voice,
            }
            return StreamingResponse(iter([audio_bytes]), headers=headers)
        except Exception as e:
            print(f"Azure TTS failed, falling back to edge-tts: {e}")
            # Fall through to edge-tts fallback
    
    # Fallback to edge-tts
    try:
        communicate = edge_tts.Communicate(text, en_voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        headers = {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
            "X-Voice": en_voice,
        }
        return StreamingResponse(iter([audio_data]), headers=headers)
    except Exception as e:
        return JSONResponse({"error": f"TTS failed: {str(e)}"}, status_code=500)


@app.get("/voices")
async def voices():
    # edge-tts exposes voices list via edge_tts.list_voices
    data = await edge_tts.list_voices()
    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5002)


