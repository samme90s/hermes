import time
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from logger import get_logger
from whisper import transcribe


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
    
    # Return a JSON response:
    if isinstance(exc, ValueError):
        return JSONResponse(
                status_code=400,
                content={"error": "Bad request"}
                )

    # Default response for any other error
    return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
            )


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
        except Exception as exc:
            return _process_error(exc)

        # Calculate processing time
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"

        logger.info(f"status_code={response.status_code} method={request.method} path={request.url.path} time={formatted_process_time}")

        return response

    @app.get("/")
    def read_root():
        return {"hello": "world"}

    @app.post("/transcribe")
    async def post_transcribe(file: UploadFile = File(...)):
        logger.debug(f"Recieved files: {file.filename}, Content-Type: {file.content_type}")
        audio_bytes = await file.read()
        logger.debug(f"File size: {len(audio_bytes)} bytes")
        transcription = transcribe(
            audio_bytes=audio_bytes,
            language="en"
            )
        return {"transcription": transcription}

except Exception as exc:
    logger.error(f"internal_error={exc}")   # Logs the error message
    logger.exception(exc)                   # Logs the full traceback

