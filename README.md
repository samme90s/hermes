# Hermes

Hermes is an automatic speech recognition platform powered by an advanced LLM model
that seamlessly converts spoken language into text. Inspired by Hermes, the swift
messenger of the Greek gods, this project is designed to bridge the gap between
voice input and digital interaction. It provides a robust client integration for
efficient, low-latency speech-to-text processing.

## Tree

```shell
.
|- src
   |- hermes (frontend)
   |- pluto  (gateway)
```

## Development

### GoLang

Go is a statically typed, compiled language that is designed for simplicity and
efficiency. It is a great language for building web servers and APIs.

This project uses [Go](https://golang.org/). Make sure to have it installed
before running the project.

### Usage

```shell
# Run the server
cd src/pluto/ && go run main.go
```

```shell
# Build the server
cd src/pluto/ && go build
```

### Bun

Bun is similar to Node, but it is written in Rust and is much faster.
A few thing it offers are: package management, bundling, and running
the project.

This project uses [Bun](https://bun.sh/), but Node works just as well
without having to modify anything!

### Usage

```shell
# Install project dependencies and run
cd src/hermes/ && bun install && bun dev
# Shortened version but does the same thing as:
# bun run <command>
```
