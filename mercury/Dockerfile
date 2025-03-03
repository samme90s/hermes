# Define the Python base version
# https://hub.docker.com/_/python/tags
ARG PYTHON_BASE=3.12-slim

# BUILD STAGE
# #######################
FROM python:${PYTHON_BASE} AS builder

# Install Git so that packages requiring it can be fetched
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install PDM
RUN pip install -U pdm

# Disable update check for PDM to avoid unnecessary network calls
ENV PDM_CHECK_UPDATE=false

# Copy project files needed for dependency installation
COPY pyproject.toml pdm.lock /app/

# Set working directory
WORKDIR /app/

# Install production dependencies into the local packages directory
RUN pdm install --check --prod --no-editable

# Set environment variables for Hugging Face caching and disable symlink warnings
ENV HF_HOME=/root/.cache/huggingface
ENV HF_HUB_DISABLE_SYMLINKS_WARNING=1

# Pre-download the model and tokenizer from Hugging Face so that caching occurs during build.
RUN pdm run python -c "from transformers import AutoModel, AutoTokenizer; \
                      AutoModel.from_pretrained('openai/whisper-tiny.en'); \
                      AutoTokenizer.from_pretrained('openai/whisper-tiny.en')"

# FINAL STAGE
# #######################
FROM python:${PYTHON_BASE}

# Install FFmpeg in the final image
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy installed dependencies from the build stage
COPY --from=builder /app/.venv/ /app/.venv

# Copy the Hugging Face cache from the builder stage
COPY --from=builder /root/.cache/huggingface /root/.cache/huggingface

# Set the PATH to include the local packages directory
ENV PATH="/app/.venv/bin:$PATH"

# Set the environment variable for the Hugging Face cache in the final image
ENV HF_HOME=/root/.cache/huggingface

# Copy application source files into the final image
COPY ./*.py /app/

# Set the working directory for running the application
WORKDIR /app

# Set the default command/entrypoint for running your script
ENTRYPOINT ["fastapi", "run"]
