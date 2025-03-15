export interface ChatResponse {
    id: string
    provider: string
    model: string
    object: string
    created: number
    choices: Array<{
        logprobs: any
        finish_reason: string
        native_finish_reason: string
        index: number
        message: {
            role: string
            content: string
            refusal: any
            reasoning: string
        }
    }>
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
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
