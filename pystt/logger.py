# logger.py (module)
# Author: Sam <samme.s90@gmail.com>
# Wrapper for the standard Python implementation of logging.
# It acts a singleton passed around to avoid duplicate loggers.
import logging
import inspect
import os

# Get the log level
log_level = os.getenv("LOG_LEVEL", "DEBUG").upper()
level = getattr(logging, log_level, logging.INFO)

# Define the log directory and file path
log_directory = os.getenv("LOG_DIR", "./.logs/")
log_file = os.path.join(log_directory, "combined.log")
# Ensure log directory exists
try:
    os.makedirs(log_directory, exist_ok=True)
except Exception as exc:
    raise SystemExit(f"Failed to create log directory: {exc}")


# Define a custom formatter with ANSI color codes
class CustomFormatter(logging.Formatter):
    # ANSI escape codes for colors
    grey = "\x1b[38;21m"
    blue = "\x1b[34;01m"
    yellow = "\x1b[33;01m"
    red = "\x1b[31;01m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    
    # Base format for log messages
    log_format = "%(levelname)s (%(asctime)s) [name: %(name)s func: %(funcName)s] %(message)s"
    
    # Map each logging level to a color-coded format
    FORMATS = {
        logging.DEBUG: grey + log_format + reset,
        logging.INFO: blue + log_format + reset,
        logging.WARNING: yellow + log_format + reset,
        logging.ERROR: red + log_format + reset,
        logging.CRITICAL: bold_red + log_format + reset
    }
    
    def format(self, record):
        # Retrieve the format corresponding to the log record's level
        log_fmt = self.FORMATS.get(record.levelno, self.log_format)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


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

    # Create a stream handler for console output and assign the custom formatter
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(CustomFormatter())

    # Add FileHandler for logging to a file (with logger name and file path)
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(level)  # Use dynamic log level for file handler

    # Define format for file logs (with logger name and file path)
    formatter = logging.Formatter("%(levelname)s (%(asctime)s) [name: %(name)s func: %(funcName)s] %(message)s")
    file_handler.setFormatter(formatter)

    # Avoid adding duplicate FileHandlers
    # Add handlers if they are not already present
    if not any(isinstance(handler, logging.StreamHandler) for handler in logger.handlers):
        logger.addHandler(console_handler)
    if not any(isinstance(handler, logging.FileHandler) for handler in logger.handlers):
        logger.addHandler(file_handler)

    return logger

