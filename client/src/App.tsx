import { useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import TranscriptBox from "./components/TranscriptBox"
import { AudioTranscriptionResponse, requestAudioTranscription } from "./services/api"

export default function App() {
    const [error, setError] = useState<string | null>(null)
    const [transcription, setTranscription] = useState<string | null>(null)

    function handleRequestCallback(response: AudioTranscriptionResponse): void {
        setTranscription(response.transcription)
    }

    return (
        <div className="p-4 min-h-screen flex flex-col items-center justify-center space-y-4">
            {error && <div className="text-red-500">{error}</div>}
            <AudioRecorder
                errorCallback={setError}
                requestAudioTranscription={requestAudioTranscription}
                requestCallback={handleRequestCallback}
            />
            {transcription && <TranscriptBox transcription={transcription} />}
        </div>
    )
}
