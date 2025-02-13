import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from logger import get_logger
from whisper import Base64Exception, transcribe_audio_base64


# Get logger with instance name
logger = get_logger()


class TranscriptionRequest(BaseModel):
    audio_base64: bytes
    language: str


def _process_error(exc) -> JSONResponse:
    """
    Process the error and return the appropriate response
    """
    # Log the error with stack trace
    logger.error(f"server_exc={exc}")
    logger.exception(exc)
    
    if isinstance(exc, Base64Exception):
        return JSONResponse(
                status_code=400,
                content={"detail": str(exc)}
                )

    # Return a JSON response:
    if isinstance(exc, ValueError):
        return JSONResponse(content={"detail": "Bad Request"}, status_code=400)

    # Default response for any other error
    return JSONResponse(content={"detail": "Internal Server Error"}, status_code=500)


try:
    app = FastAPI()

    # Cross-Origin Resource Sharing (CORS) Middleware
    #
    # Adjust the "allow_origins" list to allow requests from specific domains,
    # as * (all) allows requests from any domain.
    #
    # Update any methods and headers as needed!
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        )

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        '''
        Middleware to log requests and responses using "HTTP" log level
        '''
        start_time = time.time()

        try:
            # Process the request
            response = await call_next(request)
        except Exception as err:
            return _process_error(err)

        # Calculate processing time
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"

        logger.info(f"status_code={response.status_code} method={request.method} path={request.url.path} time={formatted_process_time}")

        return response

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

except Exception as err:
    logger.error(f"internal_error={err}")   # Logs the error message
    logger.exception(err)                   # Logs the full traceback

