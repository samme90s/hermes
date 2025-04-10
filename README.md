# Hermes

Hermes is an automatic speech recognition platform powered by an advanced LLM model
that seamlessly converts spoken language into text. Inspired by Hermes, the swift
messenger of the Greek gods, this project is designed to bridge the gap between
voice input and digital interaction. It provides a robust client integration for
efficient, low-latency speech-to-text processing.

Hecate was a multifaceted Greek goddess strongly associated with magic,
the night, the moon, ghosts, and different realms often linked to the
unseen and the boundaries between worlds. Due to these connections and her
perceived ability to move between realms, she also became seen as a guardian
of liminal spaces. This is perhaps her most defining characteristic.
She was believed to watch over crossroads, doorways, gates, and thresholds
– places of transition and decision.
Statues of her (often three-formed, facing different directions) were placed
at intersections and city gates.

> [!NOTE]
> This project only serves as a proof of concept and has not been finished.
> It is not intended for production use and should not be used as such.
> Over the course of the project multiple technologies have been used and
> interchanged, resulting this repository more closely representing the steps
> taken to learn the intricate subject of automatic speech recognition and
> working with large language models.

## Tree

```shell
.
|- src
   |- hermes (frontend)
   |- hecate (gateway)
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
cd src/hecate/ && go run main.go
```

```shell
# Build the server
cd src/hecate/ && go build
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
