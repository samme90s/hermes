import time
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from logger import get_logger
from whisper import transcribe


# Get logger with instance name
logger = get_logger()


def _get_client_ip(request: Request) -> str:
    # Check for the "X-Forwarded-For" header first.
    client_ip = request.headers.get("X-Forwarded-For")
    if client_ip:
        # Use the first IP if multiple are provided.
        client_ip = client_ip.split(",")[0].strip()
    else:
        # Check for an alternative custom header.
        client_ip = request.headers.get("X-Envoy-External-Address")
        if not client_ip:
            # Safely retrieve the client IP only if request.client is not None.
            if request.client is not None:
                client_ip = request.client.host
            else:
                client_ip = "unknown"
    return client_ip


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
        # Retrieve the client IP address using the helper function.
        client_ip = _get_client_ip(request)
    
        logger.info("Start processing request", extra={"ip_address": client_ip})

        try:
            # Process the request
            response = await call_next(request)
        except Exception as exc:
            return _process_error(exc)

        # Calculate processing time
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = f"{process_time:.2f}ms"

        # Log the request completion along with method, path, status, and processing time.
        logger.info(
            f"Completed {request.method} {request.url.path} in {formatted_process_time} with status {response.status_code}",
            extra={"ip_address": client_ip}
        )

        return response

    @app.post("/transcribe")
    async def post_transcribe(audio_file: UploadFile = File(...)):
        logger.debug(f"Recieved files: {audio_file.filename}")
        logger.debug(f"Content-Type: {audio_file.content_type}")

        audio_bytes = await audio_file.read()
        logger.debug(f"File size: {len(audio_bytes)} bytes"
                     )
        transcription = transcribe(
            audio_bytes=audio_bytes,
            language="sv"
            )
        return {"transcription": transcription}

except Exception as exc:
    logger.exception(exc) # Logs the error and full traceback

