export interface ChatResponse {
    message: string
}

export const chat = async (message: string): Promise<ChatResponse> => {
    const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    })
    if (!response.ok) {
        if (response.headers.get("Content-Type")?.includes("application/json")) {
            const error = await response.json()
            throw new Error(error.message)
        }
        if (response.headers.get("Content-Type")?.includes("text/plain")) {
            const error = await response.text()
            throw new Error(error)
        }
        throw new Error("An unknown error occurred")
    }
    return response.json()
}
