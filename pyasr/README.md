# PyASR

Python automatic speech recognition

## Development

### Poetry

Poetry is a tool for dependency management and packaging in Python.
It allows you to declare the libraries your project depends on and
it will manage (install/update) them for you by checking the
`pyproject.toml` file.

Install the following in order to use poetry:

1. [pipx](https://github.com/pypa/pipx)
2. [poetry](https://python-poetry.org/docs/#installation)

```shell
# Creates the virtual environment in the same
# directory as the pyproject.toml file.
#
# If you want this to only be applied to the current
# project and not globally add the `--local` flag.
poetry config virtualenvs.in-project true
```

### Unix/MacOS/Windows

#### Dependencies

```shell
# Install project dependencies
poetry install
```

#### Usage

```shell
# Activate environment and run program
source $(poetry env info --path)/bin/activate && python3 main.py
# Or use the following command that should work on all platforms
poetry run python main.py
```
