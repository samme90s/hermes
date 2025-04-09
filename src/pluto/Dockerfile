# Define the base versions
# https://hub.docker.com/_/golang
ARG GOLANG_BASE=1.24-alpine
# https://hub.docker.com/_/alpine
ARG ALPINE_BASE=3.21

# BUILD STAGE
# #######################
FROM golang:${GOLANG_BASE} AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY *.go ./

# Build the Go application
RUN go build -o run ./

# FINAL STAGE
# #######################
# Run stage (final image)
FROM alpine:${ALPINE_BASE}

# Set the working directory
WORKDIR /root/

# Copy the binary from the builder stage to this stage
COPY --from=builder /app/run ./

# Expose the application
EXPOSE ${PORT}

# Default command to run the executable
CMD ["./run"]
