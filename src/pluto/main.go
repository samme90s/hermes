// main.go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

// Message represents a single chat message.
// This is tied to the ChatRequest struct.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest represents the payload sent to OpenRouter.
type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

// SimpleChatRequest represents the payload sent by the client.
type SimpleChatRequest struct {
	Content string `json:"content"`
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

	orSecret = os.Getenv("OR_SECRET")
	if len(orSecret) == 0 {
		log.Fatal("OR_SECRET is required")
	}

	orUri = os.Getenv("OR_URI")
	if len(orUri) == 0 {
		log.Fatal("OR_URI is required")
	}

	orModel = os.Getenv("OR_MODEL")
	if len(orModel) == 0 {
		log.Fatal("OR_MODEL is required")
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

	// Build the ChatRequest payload for OpenRouter.
	chatReq := ChatRequest{
		Model: orModel,
		Messages: []Message{
			{
				Role:    "user",
				Content: simpleReq.Content,
			},
		},
	}
	log.Printf("ChatRequest: %+v", chatReq)

	// Marshal the ChatRequest into JSON for the OpenRouter API.
	chatReqJSON, err := json.Marshal(chatReq)
	if err != nil {
		respondWithError(
			w,
			http.StatusInternalServerError,
			"Error creating JSON payload. Please try again later.",
		)
		return
	}

	// Create a new HTTP request to OpenRouter.
	req, err := http.NewRequest("POST", orUri, bytes.NewBuffer(chatReqJSON))
	if err != nil {
		respondWithError(w, http.StatusInternalServerError,
			"Error creating request to OpenRouter. Please try again later.")
		return
	}

	// Set necessary headers.
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+orSecret)

	// Send the request to OpenRouter.
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		respondWithError(
			w,
			http.StatusInternalServerError,
			"Error communicating with OpenRouter. Please try again later.",
		)
		log.Printf("Error sending request: %v", err)
		return
	}
	defer resp.Body.Close()

	// Read the OpenRouter API response.
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		respondWithError(
			w,
			http.StatusInternalServerError,
			"Error reading response from OpenRouter. Please try again later.",
		)
		return
	}

	// Log the status from OpenRouter for debugging.
	log.Printf("OpenRouter responded with status: %d", resp.StatusCode)

	// Forward the OpenRouter response to the client.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	if _, err := w.Write(respBody); err != nil {
		log.Printf("Error writing response to client: %v", err)
	}
}
