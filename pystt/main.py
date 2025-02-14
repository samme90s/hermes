import time
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from logger import get_logger
from whisper import transcribe


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
        logger.info(f"ip: {client_ip}")
        logger.info(f"m: {request.method} {request.url.path}")

        try:
            # Process the request
            response = await call_next(request)
        except Exception as exc:
            return _process_error(exc)

        # Calculate processing time
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"

        # Log response info and process time
        logger.info(f"s: {response.status_code}")
        logger.info(f"t: {formatted_process_time}")

        return response

    @app.post("/transcribe")
    async def post_transcribe(audio_file: UploadFile = File(...)):
        # Log file info for debug purposes
        logger.debug(f"Recieved files: {audio_file.filename}")
        logger.debug(f"Content-Type: {audio_file.content_type}")
        audio_bytes = await audio_file.read()
        logger.debug(f"File size: {len(audio_bytes)} bytes")

        transcription = transcribe(
            audio_bytes=audio_bytes,
            language="en"
        )
        return {"transcription": transcription}

except Exception as exc:
    logger.exception(exc) # Logs the error and full traceback

