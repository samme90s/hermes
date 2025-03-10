// main.go
package main

import (
	"bytes"         // To create a buffer for our JSON payload
	"encoding/json" // To marshal/unmarshal JSON data
	"fmt"           // For formatted I/O
	"io/ioutil"     // To read the HTTP response body
	"log"           // For logging errors and informational messages
	"net/http"      // For building the HTTP server and making HTTP requests
	"os"            // For accessing environment variables

	"github.com/joho/godotenv" // Import godotenv for loading .env files
)

// Message represents a single chat message.
type Message struct {
	Role    string `json:"role"`    // "user" or "assistant"
	Content string `json:"content"` // The text content of the message
}

// ChatRequest represents the final payload sent to OpenRouter.
// The "Model" field will always be set from the environment variable.
type ChatRequest struct {
	Model    string    `json:"model"`    // The model id from OpenRouter
	Messages []Message `json:"messages"` // Chat history/messages
}

// ClientChatRequest is used only to unmarshal the client input,
// and deliberately does NOT include the model field.
type ClientChatRequest struct {
	Messages []Message `json:"messages"`
}

// ChatResponse represents the expected structure of the OpenRouter response.
type ChatResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

// Global configuration variables populated from the environment.
var (
	port      string
	orSecret  string
	orUri     string
	orModel   string
	orTitle   string
	orReferer string
)

// respondWithError sends a JSON-formatted error response with a given HTTP status code.
func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	response := map[string]string{"error": message}
	_ = json.NewEncoder(w).Encode(response)
}

func main() {
	// LOCAL DEVELOPMENT
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: could not load environment file %v", err)
	}

	// Retrieve required environment variables.
	port = os.Getenv("PORT")
	orSecret = os.Getenv("OR_SECRET")
	orUri = os.Getenv("OR_URI")
	orModel = os.Getenv("OR_MODEL")
	orTitle = os.Getenv("OR_TITLE")
	orReferer = os.Getenv("OR_REFERER")

	// Check for missing, non-optional environment variables.
	if port == "" {
		log.Fatal("PORT is required")
	}
	if orSecret == "" {
		log.Fatal("OR_SECRET is required")
	}
	if orUri == "" {
		log.Fatal("OR_URI is required")
	}
	if orModel == "" {
		log.Fatal("OR_MODEL is required")
	}

	// Set up the HTTP handler for the API gateway.
	http.HandleFunc("/api/chat", chatHandler)

	// Start the HTTP server.
	fmt.Println("API Gateway is running on port: " + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// chatHandler acts as a proxy to the OpenRouter API.
func chatHandler(w http.ResponseWriter, r *http.Request) {
    // Only allow POST requests.
    if r.Method != http.MethodPost {
        respondWithError(w, http.StatusMethodNotAllowed,
            "Invalid method. Only POST requests are allowed. Please use POST and include a valid JSON payload.")
        return
    }

    // Read the client JSON payload.
    clientPayload, err := ioutil.ReadAll(r.Body)
    if err != nil {
        respondWithError(w, http.StatusBadRequest,
            "Unable to read the request body. Please ensure you're sending a proper JSON payload.")
        return
    }
    defer r.Body.Close()

    // Unmarshal the client payload into a structure that excludes the model field.
    var clientReq ClientChatRequest
    if err := json.Unmarshal(clientPayload, &clientReq); err != nil {
        respondWithError(w, http.StatusBadRequest,
            "Invalid JSON payload. Expected format: { \"messages\": [{ \"role\": \"user\", \"content\": \"your message\" }] }")
        return
    }

    // Validate that the messages field contains data.
    if len(clientReq.Messages) == 0 {
        respondWithError(w, http.StatusBadRequest,
            "Invalid JSON payload. Please provide at least one message in the 'messages' field.")
        return
    }

    // Build the final ChatRequest, using orModel from the environment.
    chatReq := ChatRequest{
        Model:    orModel,
        Messages: clientReq.Messages,
    }
    log.Printf("ChatRequest: %+v", chatReq)

    // Marshal the ChatRequest into JSON for the OpenRouter API.
    jsonData, err := json.Marshal(chatReq)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError,
            "Error creating JSON payload. Please try again later.")
        return
    }

    // Create a new HTTP POST request to OpenRouter.
    req, err := http.NewRequest("POST", orUri, bytes.NewBuffer(jsonData))
    if err != nil {
        respondWithError(w, http.StatusInternalServerError,
            "Error creating request to OpenRouter. Please try again later.")
        return
    }

    // Set necessary headers.
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+orSecret)
    if orReferer != "" {
        req.Header.Set("HTTP-Referer", orReferer)
    }
    if orTitle != "" {
        req.Header.Set("X-Title", orTitle)
    }

    // Send the request to OpenRouter.
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError,
            "Error communicating with OpenRouter. Please try again later.")
        log.Printf("Error sending request: %v", err)
        return
    }
    defer resp.Body.Close()

    // Read the OpenRouter API response.
    respBody, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError,
            "Error reading response from OpenRouter. Please try again later.")
        return
    }

    // Log the status from OpenRouter for debugging.
    log.Printf("OpenRouter responded with status: %d", resp.StatusCode)

    // Forward the OpenRouter response, including its status code and JSON body, to the client.
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(resp.StatusCode)
    if _, err := w.Write(respBody); err != nil {
        log.Printf("Error writing response to client: %v", err)
    }
}
