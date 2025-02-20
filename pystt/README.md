# Pystt

Python speech to text

## Dependencies

### ffmpeg

This mostly comes pre-installed on Linux distros,
otherwise search on how to download it for your platform.

```shell
# Windows
winget install ffmpeg
```

## Development

### PDM

See:
[https://pdm-project.org/en/latest](https://pdm-project.org/en/latest)
for installation process.

### Usage

```shell
# Install dependencies and activate Python environment
pdm install &&
# Windows
./.venv/Scripts/activate.ps1
# Linux
source .venv/bin/activate
```

```shell
# Run program
fastapi dev
```
