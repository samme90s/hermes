import { useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import AudioControls from "./components/AudioControls"
import TranscriptBox from "./components/TranscriptBox"

export default function App() {
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioURL] = useState<string | null>(null)
    const [transcription, setTranscription] = useState<string | null>(null)

    function handleRecordingCallback(audioUrl: string, transcription: string | null) {
        setAudioURL(audioUrl)
        setTranscription(transcription)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            {error && <div className="text-red-500">{error}</div>}
            <AudioRecorder
                errorCallback={setError}
                recordingCallback={handleRecordingCallback}
            />
            {transcription && <TranscriptBox transcription={transcription} />}
        </div>
    )
}
