import { FC, useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Loading, Hex } from "./components/loading"
import { DialogBox } from "./components/dialog_box"
import { Box } from "./components/box"
import { chat, ChatResponse } from "./services/gateway"
import { ReadButton } from "./components/read_button"
import { RecordButton } from "./components/record_button"

export const App: FC = () => {
    const [currentLabel, setCurrentLabel] = useState<string>("Hey")
    const [currentText, setCurrentText] = useState<string>("Please ask away...")
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    const answerMutation = useMutation<ChatResponse, Error, string>({
        mutationFn: (prompt) => chat(prompt),
        onSuccess: (data) => setCurrentText(data.message),
        onError: (error) => console.error(error),
    })

    // Effect runs whenever 'audioBlob' changes
    useEffect(() => {
        // Only proceed if audioBlob is not null (i.e., a new recording was likely set)
        if (audioBlob) {
            try {
                setCurrentLabel("Transcribing audio...")
                setCurrentText("...")

                // transcribe logic or api call

                answerMutation.mutate("Here is the text that was transcribed from the audio blob.")

                setCurrentLabel("Here is an awesome label that the api should return.")
            } catch (err) {
                console.error("Transcription error:", err)
                setCurrentLabel("Error during transcription.")
                setCurrentText("")
            } finally {
                // Optional: Reset audioBlob to null after processing to prevent
                // re-triggering if the component re-renders for other reasons
                // without the RecordButton providing a *new* blob instance.
                // Be cautious if transcription is slow and re-renders might occur.
                setAudioBlob(null)
            }
        }
    }, [audioBlob])

    return (
        <div className="max-w-xl mx-auto p-2 space-y-2">
            <Box className="overflow-y-auto">
                <div>
                    <DialogBox text={currentText} label={currentLabel} />
                    {answerMutation.isPending && <Loading color={Hex.BLUE} />}
                    <div className="flex justify-center mt-4">
                        <ReadButton text={currentText} disabled={answerMutation.isPending} className="flex-1/2 h-12" />
                        <RecordButton onChange={setAudioBlob} disabled={answerMutation.isPending} className="flex-1/2 h-12" />
                    </div>
                </div>
            </Box>
        </div>
    )
}
