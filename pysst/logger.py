# logger.py
import coloredlogs
import logging
import inspect
import os

# Get the log level
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
level = getattr(logging, log_level, logging.INFO)

# Define the log directory and file path
log_directory = os.getenv("LOG_DIR", "./.logs/")
log_file = os.path.join(log_directory, "combined.log")

# Ensure log directory exists
try:
    os.makedirs(log_directory, exist_ok=True)
except Exception as e:
    raise SystemExit(f"Failed to create log directory: {e}")


# Custom logging filter to insert additional context into log records
class ContextFilter(logging.Filter):
    def filter(self, record):
        # Add the sender's IP address to the log record if not provided.
        if not hasattr(record, 'ip_address'):
            record.ip_address = 'N/A'
        # You may add further default fields here if needed.
        return True


def get_logger(name: str = "") -> logging.Logger:
    '''
    Function to create or get a logger with the specified name.
    Defaults to using the caller's filename as the logger name.
    '''
    if not name:
        frame = inspect.currentframe()  # Get the current frame
        # Ensure that both the current frame and the caller's frame exist
        if frame is not None and frame.f_back is not None:
            caller_file = inspect.getfile(frame.f_back)  # Get caller's file path
            name = os.path.basename(caller_file)  # Extract just the filename
        else:
            # Fallback logger name if frame info is unavailable
            name = __name__

    # Create or get a logger with the specified name
    logger = logging.getLogger(name)
    logger.setLevel(level)  # Set logger level dynamically

    # Add our custom context filter so that every record has an ip_address field (and others if added)
    logger.addFilter(ContextFilter())

    # Define an enhanced format that now includes ip_address and the function name
    formatter = logging.Formatter(
        "(%(asctime)s) [%(pathname)s] [IP: %(ip_address)s] [func: %(funcName)s] %(name)s %(levelname)s: %(message)s"
        )

    # Setup coloredlogs for console output (with logger name and file path)
    coloredlogs.install(
        level="DEBUG",
        logger=logger,
        fmt=formatter._fmt,
        level_styles={
            "debug": {"color": "green"},
            "info": {"color": "blue"},
            "error": {"color": "red"},
            "warning": {"color": "yellow"},
            "critical": {"color": "red", "bold": True}
        }
    )

    # Add FileHandler for logging to a file (with logger name and file path)
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(level)  # Use dynamic log level for file handler

    # Define format for file logs (with logger name and file path)
    file_handler.setFormatter(formatter)

    # Avoid adding duplicate FileHandlers
    if not any(isinstance(handler, logging.FileHandler) for handler in logger.handlers):
        logger.addHandler(file_handler)

    return logger

