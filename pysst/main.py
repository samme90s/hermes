from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from whisper import Base64Exception, transcribe_audio_base64

class TranscriptionRequest(BaseModel):
    audio_base64: bytes
    language: str

app = FastAPI()

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        if isinstance(exc, Base64Exception):
            return JSONResponse(
                    status_code=400,
                    content={"detail": str(exc)}
                    )

        # Default (fallback)
        return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
                )

@app.get("/")
def read_root():
    return {"hello": "world"}

@app.post("/transcribe")
def transcribe(request: TranscriptionRequest):
    transcription = transcribe_audio_base64(
        audio_base64=request.audio_base64,
        language=request.language
    )
    return {"transcription": transcription}
