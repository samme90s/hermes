// Main application component file for the chat/voice interface.
// This component orchestrates the UI, manages state for conversation
// text and audio recordings, and handles interactions with services
// like transcription (simulated) and chat API calls.

import { FC, useEffect, useState } from "react"
// Import query hook for data fetching/mutation.
import { useMutation } from "@tanstack/react-query"
// Import UI components.
import { Loading, Hex } from "./components/loading"
import { DialogBox } from "./components/dialog_box"
import { Box } from "./components/box"
// Import service call function and type.
import { chat, ChatResponse } from "./services/gateway"
// Import button components.
import { ReadButton } from "./components/read_button"
import { RecordButton } from "./components/record_button"

// Main application component providing a chat/voice interface.
export const App: FC = () => {
    // State for the label displayed in the dialog box (e.g., speaker name, status).
    const [currentLabel, setCurrentLabel] = useState<string>("Hey")
    // State for the main text content displayed in the dialog box.
    const [currentText, setCurrentText] = useState<string>("Please ask away...")
    // State to hold the most recent audio recording data (Blob object).
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    // Mutation hook from React Query to handle sending prompts to the chat service.
    const answerMutation = useMutation<ChatResponse, Error, string>({
        // Function that performs the API call.
        mutationFn: (prompt) => chat(prompt),
        // Callback on successful API response: updates the displayed text.
        onSuccess: (data) => setCurrentText(data.message),
        // Callback on API error: logs the error.
        onError: (error) => console.error(error),
    })

    // Effect hook that runs when a new audio recording (audioBlob) is available.
    // Simulates a transcription and chat interaction flow.
    useEffect(() => {
        // Proceeds only if there's new audio data.
        if (audioBlob) {
            try {
                // Update UI to indicate processing started.
                setCurrentLabel("Transcribing audio...")
                setCurrentText("...")

                // Placeholder: Add actual audio transcription logic/API call here.
                const transcribedText = "Here is the text that was transcribed from the audio blob." // Replace with actual result.

                // Trigger the chat mutation with the (simulated) transcribed text.
                answerMutation.mutate(transcribedText)

                // Placeholder: Update label based on API response or other logic.
                setCurrentLabel("Here is an awesome label that the api should return.")
            } catch (err) {
                // Handle errors during the process.
                console.error("Transcription/Mutation error:", err)
                setCurrentLabel("Error during processing.")
                setCurrentText("")
            } finally {
                // Reset audioBlob to null to prevent re-running the effect
                // without a new recording from the RecordButton.
                setAudioBlob(null)
            }
        }
        // Dependency array ensures this runs only when audioBlob changes.
    }, [audioBlob]) // Note: answerMutation is stable and doesn't need to be listed.

    // Renders the main UI layout.
    return (
        <div className="max-w-xl mx-auto p-2 space-y-2">
            {/* Box component acts as the main container for the dialog and controls. */}
            <Box className="overflow-y-auto">
                <div>
                    {/* Displays the current label and text content. */}
                    <DialogBox text={currentText} label={currentLabel} />
                    {/* Shows a loading indicator while the chat mutation is in progress. */}
                    {answerMutation.isPending && <Loading color={Hex.BLUE} />}
                    {/* Container for the action buttons. */}
                    <div className="flex justify-center mt-4">
                        {/* Button to read the current text aloud. Disabled during loading. */}
                        <ReadButton text={currentText} disabled={answerMutation.isPending} className="flex-1/2 h-12" />
                        {/* Button to record audio. Updates audioBlob state on completion. Disabled during loading. */}
                        <RecordButton onChange={setAudioBlob} disabled={answerMutation.isPending} className="flex-1/2 h-12" />
                    </div>
                </div>
            </Box>
        </div>
    )
}
