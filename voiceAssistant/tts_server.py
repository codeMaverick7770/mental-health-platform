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
# Added defaults for J&K and regional language support
DEFAULT_UR_VOICE = "ur-PK-UzmaNeural"  # Urdu (closest available; PK locale)
DEFAULT_PA_VOICE = "pa-IN-GaganNeural"  # Punjabi (India)

app = FastAPI(title="Neural TTS Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_lang(segment: str) -> str:
    # Quick heuristics for script-based detection
    for ch in segment:
        # Devanagari => Hindi
        if '\u0900' <= ch <= '\u097F':
            return 'hi'
        # Gurmukhi => Punjabi
        if '\u0A00' <= ch <= '\u0A7F':
            return 'pa'
        # Arabic script ranges (Urdu)
        if ('\u0600' <= ch <= '\u06FF') or ('\u0750' <= ch <= '\u077F') or ('\u08A0' <= ch <= '\u08FF'):
            return 'ur'
    # Token heuristics for Latin transliterations (approx for Hinglish/Urdu/Punjabi/Dogri/Kashmiri)
    tokens = {t.lower() for t in segment.split()}
    hinglish_tokens = {"nahi","ha","haan","achha","theek","vaise","kuch","zyada","kam","kaise","kyun","bahut","thoda","sach","galat","dost","parivaar","padhai","imtihan","tension"}
    roman_urdu_tokens = {"nahi","haan","acha","theek","kaise","kyun","zyada","kam","dost","parivaar","imtihan","khushi","gham","udaas"}
    roman_punjabi_tokens = {"haan","nahi","theek","ki","kyon","kiven","dost","parivaar","padhai","dil","udaas"}
    roman_dogri_tokens = {"thare","ki","ke","karna","bada","chhota","kitho","ithe","teth","tension","udaas"}
    roman_kashmiri_tokens = {"mech","yiman","kyazi","chu","karan","beyi","zyaad","kam","dil","udaas"}
    if tokens & roman_urdu_tokens:
        return 'ur'
    if tokens & roman_punjabi_tokens:
        return 'pa'
    if tokens & roman_kashmiri_tokens:
        return 'ur'  # map Kashmiri to Urdu voices (closest available)
    if tokens & roman_dogri_tokens:
        return 'hi'  # map Dogri to Hindi voices (closest available)
    if tokens & hinglish_tokens:
        return 'hi'
    return 'en'


def build_ssml(
    text: str,
    en_voice: str,
    hi_voice: str,
    base_rate: float,
    base_semitones: float,
    style: str | None,
    role: str | None,
    style_degree: float | None,
    ur_voice: str | None = None,
    pa_voice: str | None = None,
) -> str:
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
        # Gentle contouring by style
        if style == 'empathetic':
            r *= 0.98
            st += 0.1
        elif style == 'sad':
            r *= 0.96
            st -= 0.2
        elif style == 'cheerful':
            r *= 1.02
            st += 0.3
        elif style == 'calm':
            r *= 0.97
            st += 0.0
        rate_pct = f"{int((r-1.0)*100)}%"
        pitch_st = f"{st:+.1f}st"
        lang = detect_lang(s)
        if lang == 'hi':
            vname = hi_voice
            lang_code = 'hi-IN'
        elif lang == 'ur':
            vname = (ur_voice or DEFAULT_UR_VOICE)
            lang_code = 'ur-PK'
        elif lang == 'pa':
            vname = (pa_voice or DEFAULT_PA_VOICE)
            lang_code = 'pa-IN'
        else:
            vname = en_voice
            lang_code = 'en-IN'
        style_attr = f" style='{style}'" if style else ""
        style_degree_attr = (
            f" styledegree='{max(0.01, min(2.0, float(style_degree))):.2f}'" if style_degree else ""
        )
        role_attr = f" role='{role}'" if role else ""
        # voice-scoped express-as + prosody
        parts.append(
            f"<voice name='{vname}' xml:lang='{lang_code}'>"
            f"<mstts:express-as{style_attr}{style_degree_attr}{role_attr}>"
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
    ur_voice: str = (payload.get("urduVoice") or DEFAULT_UR_VOICE).strip()
    pa_voice: str = (payload.get("punjabiVoice") or DEFAULT_PA_VOICE).strip()
    # base pacing (~0.95 = slightly slower), in multiplicative terms
    base_rate_mult: float = float(payload.get("pace") or 0.95)
    base_semitones: float = float(payload.get("semitones") or 0.5)  # gentle warmth
    style: str | None = payload.get("style") or "empathetic"
    role: str | None = payload.get("role") or "YoungAdultFemale"
    style_degree: float | None = None
    try:
        style_degree = float(payload.get("styleDegree")) if payload.get("styleDegree") is not None else None
    except Exception:
        style_degree = None

    # Reasonable defaults per style if none provided
    if style_degree is None:
        defaults = {
            "empathetic": 1.3,
            "sad": 1.1,
            "calm": 1.2,
            "cheerful": 1.4,
        }
        style_degree = defaults.get(style or "", 1.2)
    if not text:
        return JSONResponse({"error": "text is required"}, status_code=400)

    # Check if Azure credentials are available
    speech_key = os.environ.get("SPEECH_KEY", "")
    speech_region = os.environ.get("SPEECH_REGION", "")
    
    if speech_key and speech_region:
        # Use Azure Neural TTS
        try:
            ssml = build_ssml(
                text,
                en_voice,
                hi_voice,
                base_rate_mult,
                base_semitones,
                style,
                role,
                style_degree,
                ur_voice=ur_voice,
                pa_voice=pa_voice,
            )
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
    
    # Fallback to edge-tts (pick closest voice by detected language)
    try:
        lang = detect_lang(text)
        if lang == 'hi':
            fallback_voice = hi_voice
            target_locale = 'hi-IN'
        elif lang == 'ur':
            fallback_voice = ur_voice or DEFAULT_UR_VOICE
            target_locale = 'ur-PK'
        elif lang == 'pa':
            fallback_voice = pa_voice or DEFAULT_PA_VOICE
            target_locale = 'pa-IN'
        else:
            fallback_voice = en_voice
            target_locale = 'en-IN'

        # Verify the voice exists in edge-tts; if not, pick any voice for the target locale,
        # and if still missing (e.g., Punjabi not available), fall back to Hindi.
        try:
            voices = await edge_tts.list_voices()
            shortnames = {v.get('ShortName') for v in voices}
            if fallback_voice not in shortnames:
                # pick first voice matching locale
                alt = next((v.get('ShortName') for v in voices if v.get('Locale') == target_locale), None)
                if not alt and target_locale == 'pa-IN':
                    # Edge sometimes lacks Punjabi voices; fall back to Hindi
                    alt = next((v.get('ShortName') for v in voices if v.get('Locale') == 'hi-IN'), None)
                fallback_voice = alt or fallback_voice
        except Exception:
            pass

        communicate = edge_tts.Communicate(text, fallback_voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        headers = {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
            "X-Voice": fallback_voice,
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


