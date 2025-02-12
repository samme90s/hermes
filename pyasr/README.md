# PyASR

Python automatic speech recognition

## Unix/MacOS

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

### Usage

```shell
# Installs project dependencies
poetry install &&
# Activates the virtual environment
source $(poetry env info --path)/bin/activate &&
# Run the setup script
source ./setup_sh &&
# Run the main script
python3 main.py
```
