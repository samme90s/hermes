import time
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from logger import get_logger
from whisper import transcribe


# Globals
KB_MAX = 1024
MB_MAX = KB_MAX * 1024

ALLOWED_CONTENT_TYPES = {"audio/mpeg", "audio/wave", "audio/webm"}


# Get logger with instance name
logger = get_logger()


def _process_error(exc) -> JSONResponse:
    """
    Process the error and return the appropriate response
    """
    # Log the error with stack trace
    logger.error(f"server_exc={exc}")
    logger.exception(exc)
    
    # Return a JSON response:
    if isinstance(exc, ValueError):
        # Perhaps return a static string here?
        return JSONResponse(
                status_code=400,
                content={"error": str(exc)}
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
      
        # Log request info
        client_ip = request.client.host if request.client else "missing"
        logger.info(f"IP: {client_ip}")
        logger.info(f"Method: {request.method} {request.url.path}")

        try:
            # Process the request
            response = await call_next(request)
        except Exception as exc:
            return _process_error(exc)

        # Calculate processing time
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"

        # Log response info and process time
        logger.info(f"Status: {response.status_code}")
        logger.info(f"Time: {formatted_process_time}")

        return response

    @app.post("/transcribe")
    async def post_transcribe(audio_file: UploadFile = File(...)):
        # Log file info for debug purposes
        logger.debug(f"Recieved files: {audio_file.filename}")

        if audio_file.content_type is None:
            raise HTTPException(
                    status_code=400,
                    detail="Missing Content-Type header in uploaded file"
                    )

        logger.debug(f"Content-Type: {audio_file.content_type}")

        # Extract the base type (ignoring codec parameters)
        base_content_type = audio_file.content_type.split(";")[0].strip()
        if base_content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                    status_code=415,
                    detail=f"Unsupported file type. Supported formats: {', '.join(ALLOWED_CONTENT_TYPES)}"
                    )

        audio_bytes = await audio_file.read()
        logger.debug(f"File size: {(len(audio_bytes) / KB_MAX):.2f} KB")
        # Ensure that the file size is smaller than 1MB
        # before trying to process it...
        # (even though loading it in to memory here might not be as optimal)
        if len(audio_bytes) > MB_MAX:
            raise HTTPException(
                    status_code=413,
                    detail="File size exceeds the 1MB limit"
                    )

        transcription = transcribe(
                audio_bytes=audio_bytes,
                language="en"
                )

        return {"transcription": transcription}

except Exception as exc:
    logger.exception(exc) # Logs the error and full traceback

