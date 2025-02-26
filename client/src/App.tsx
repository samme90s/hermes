import { useEffect, useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import { requestAudioTranscription } from "./services/api"
import Loading from "./components/Loading"
import { HexColors } from "./lib/colors"
import Section from "./components/Section"

export default function App() {
    const [error, setError] = useState<string | null>(null)
    const [blob, setBlob] = useState<Blob | null>(null)
    const [transcriptionLoading, setTranscriptionLoading] = useState<boolean>(false)
    const [transcription, setTranscription] = useState<string | null>(null)

    async function handleRequestTranscription(): Promise<void> {
        if (!blob) {
            return
        }
        setTranscriptionLoading(true)
        const res = await requestAudioTranscription(blob)
        setTranscriptionLoading(false)
        setTranscription(res.transcription)
    }

    useEffect(() => {
        handleRequestTranscription()
    }, [blob])

    return (
        <div className="p-4 min-h-screen flex flex-col items-center justify-center space-y-4">
            <AudioRecorder
                errorCallback={setError}
                blobCallback={setBlob}
            />
            {error && <Section label="Error" text={error} className="text-red-500" />}
            {transcriptionLoading && <Loading color={HexColors.RED} />}
            {(!transcriptionLoading && transcription) && <Section label="Transcription" text={transcription} />}
        </div>
    )
}
