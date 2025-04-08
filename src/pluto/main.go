// main.go
package main

import (
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

// SimpleChatRequest represents the payload sent by the client.
type SimpleChatRequest struct {
	Content string `json:"content"`
}

// SimpleChatResponse represents the structured response returned by the API.
type SimpleChatResponse struct {
	Message string `json:"message"`
}

// Global configuration variables populated from the environment.
var (
	port     string
	orSecret string
	orUri    string
	orModel  string
)

// respondWithError sends a JSON-formatted error response with a given HTTP status code.
func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	response := map[string]string{"error": message}
	_ = json.NewEncoder(w).Encode(response)
}

func main() {
	godotenv.Load("./.env")

	port = os.Getenv("PORT")
	if len(port) == 0 {
		log.Fatal("PORT is required")
	}

	// Set up the HTTP handler for the API gateway.
	http.HandleFunc("/api/chat", chatHandler)

	// Start the HTTP server.
	addr := ":" + port
	fmt.Printf("API Gateway is running at http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// chatHandler acts as a proxy to the OpenRouter API.
func chatHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests.
	if r.Method != http.MethodPost {
		respondWithError(
			w,
			http.StatusMethodNotAllowed,
			"Invalid method. Only POST requests are allowed. Please include a valid JSON payload.",
		)
		return
	}

	// Create a JSON decoder and disallow unknown fields.
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	// Decode the client's JSON payload into a SimpleChatRequest.
	var simpleReq SimpleChatRequest
	if err := decoder.Decode(&simpleReq); err != nil {
		respondWithError(
			w,
			http.StatusBadRequest,
			"Invalid JSON payload. Expected **only** the 'content' field, e.g. { \"content\": \"your message\" }.",
		)
		return
	}
	defer r.Body.Close()

	// Validate that the content field is provided.
	if len(simpleReq.Content) == 0 {
		respondWithError(
			w,
			http.StatusBadRequest,
			"Invalid JSON payload. Please provide the 'content' field with your message.",
		)
		return
	}

	// Create a structured response
	response := SimpleChatResponse{
		Message: "Request: " + simpleReq.Content + " -- Response: Hello from the api gateway!",
	}
	// Mock response to the client.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error writing response to client: %v", err)
	}
}
