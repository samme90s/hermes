// Defines the chat API interaction logic, including the
// expected response structure and the function to call the API endpoint.

// Interface defining the expected structure of a successful response from the chat API.
export interface ChatResponse {
    // The main message content returned by the API.
    message: string
}

// Sends a message to the backend chat API endpoint and returns the response.
// Input: The user's message string.
// Output: A Promise resolving to a ChatResponse object on success,
//         or rejecting with an Error on failure.
export const chat = async (message: string): Promise<ChatResponse> => {
    // Make a POST request to the specific chat API endpoint.
    const response = await fetch("http://localhost/api/chat", {
        method: "POST",
        // Set request headers, indicating JSON content.
        headers: { "Content-Type": "application/json" },
        // Send the message in the request body, structured as JSON.
        body: JSON.stringify({ content: message }),
    })

    // Check if the response status indicates an error (not status 200-299).
    if (!response.ok) {
        // Attempt to parse specific error messages based on response content type.
        if (response.headers.get("Content-Type")?.includes("application/json")) {
            const error = await response.json()
            // Throw error using message from JSON response.
            throw new Error(error.message || "API returned JSON error without message field")
        }
        if (response.headers.get("Content-Type")?.includes("text/plain")) {
            const error = await response.text()
            // Throw error using text response.
            throw new Error(error)
        }
        // Fallback for unknown error types.
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    // If response is ok, parse the JSON body and return it.
    // Assumes the successful response matches the ChatResponse interface.
    return response.json()
}
