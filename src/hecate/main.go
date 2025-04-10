// main.go - Implements a simple Go HTTP server acting as an API gateway.
// It defines a chat endpoint (/api/chat) that validates incoming requests
// and currently returns a mock response.
package main

import (
	"encoding/json" // For JSON encoding/decoding.
	"fmt"           // For printing formatted output.
	"log"           // For logging messages.
	"net/http"      // For building the HTTP server and handling requests.
	"os"            // For accessing environment variables.

	// Third-party library to load environment variables from a .env file.
	"github.com/joho/godotenv"
)

// SimpleChatRequest defines the expected JSON structure for incoming chat requests.
type SimpleChatRequest struct {
	// Content holds the message sent by the client.
	Content string `json:"content"`
}

// SimpleChatResponse defines the JSON structure for successful chat responses.
type SimpleChatResponse struct {
	// Message holds the response message returned by the API.
	Message string `json:"message"`
}

// Global variables to hold configuration loaded from the environment.
// Note: OpenRouter variables are declared but not used in the current chatHandler.
var (
	port     string // Port for the HTTP server to listen on.
	orSecret string // Placeholder for OpenRouter API secret.
	orUri    string // Placeholder for OpenRouter API URI.
	orModel  string // Placeholder for OpenRouter model identifier.
)

// respondWithError is a helper function to send standardized JSON error responses.
// It sets the Content-Type header, writes the HTTP status code, and sends a JSON body.
func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	// Create a simple map for the JSON error response structure.
	response := map[string]string{"error": message}
	// Encode the map to JSON and write it to the response writer. Ignore potential encoding errors.
	_ = json.NewEncoder(w).Encode(response)
}

// main is the entry point of the application.
func main() {
	// Load environment variables from the .env file in the current directory.
	// Errors loading the file are ignored (godotenv behavior).
	godotenv.Load("./.env")

	// Get the PORT environment variable.
	port = os.Getenv("PORT")
	// Ensure PORT is set, otherwise log a fatal error and exit.
	if len(port) == 0 {
		log.Fatal("PORT environment variable is required")
	}

	// Register the chatHandler function to handle requests to the /api/chat path.
	http.HandleFunc("/api/chat", chatHandler)

	// Start the HTTP server.
	addr := ":" + port // Format the address string (e.g., ":8080").
	fmt.Printf("API Gateway is running at http://localhost%s\n", addr)
	// ListenAndServe blocks until the server stops (e.g., due to an error).
	if err := http.ListenAndServe(addr, nil); err != nil {
		// Log a fatal error if the server fails to start or stops unexpectedly.
		log.Fatalf("Server failed: %v", err)
	}
}

// chatHandler handles incoming requests to the /api/chat endpoint.
// It validates the request and currently returns a mock response.
func chatHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure the request method is POST.
	if r.Method != http.MethodPost {
		respondWithError(
			w,
			http.StatusMethodNotAllowed, // 405 Method Not Allowed.
			"Invalid method. Only POST requests are allowed.",
		)
		return
	}

	// Decode the JSON request body.
	decoder := json.NewDecoder(r.Body)
	// Prevent decoding if the JSON contains fields not defined in SimpleChatRequest.
	decoder.DisallowUnknownFields()

	var simpleReq SimpleChatRequest
	// Attempt to decode the request body into the simpleReq struct.
	if err := decoder.Decode(&simpleReq); err != nil {
		respondWithError(
			w,
			http.StatusBadRequest, // 400 Bad Request.
			"Invalid JSON payload. Expected only the 'content' field.",
		)
		return
	}
	// Ensure the request body is closed after the handler finishes.
	defer r.Body.Close()

	// Validate that the 'content' field is not empty.
	if len(simpleReq.Content) == 0 {
		respondWithError(
			w,
			http.StatusBadRequest, // 400 Bad Request.
			"Invalid JSON payload. The 'content' field cannot be empty.",
		)
		return
	}

	// --- Current behavior: Return a mock response ---
	// Create a mock response containing the original request content.
	response := SimpleChatResponse{
		Message: "Request received: " + simpleReq.Content + " -- Response: Hello from the Go API gateway!",
	}

	// Send the successful mock response back to the client.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // 200 OK.
	// Encode the response struct to JSON and write it to the response writer.
	if err := json.NewEncoder(w).Encode(response); err != nil {
		// Log any error that occurs while writing the response.
		log.Printf("Error writing response to client: %v", err)
	}
}

