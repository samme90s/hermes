import { useEffect, useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import ResponseBox from "./components/ResponseBox"
import { requestAudioTranscription, requestChat } from "./services/api"
import Loading from "./components/Loading"
import { HexColors } from "./lib/colors"

export default function App() {
    const [error, setError] = useState<string | null>(null)
    const [blob, setBlob] = useState<Blob | null>(null)
    const [transcriptionLoading, setTranscriptionLoading] = useState<boolean>(false)
    const [transcription, setTranscription] = useState<string | null>(null)
    const [chatLoading, setChatLoading] = useState<boolean>(false)
    const [chat, setChat] = useState<string | null>(null)

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

    async function handleRequestChat(): Promise<void> {
        if (!transcription) {
            return
        }
        setChatLoading(true)
        const res = await requestChat(transcription)
        setChatLoading(false)
        setChat(res.response)
    }

    useEffect(() => {
        handleRequestChat()
    }, [transcription])

    return (
        <div className="p-4 min-h-screen flex flex-col items-center justify-center space-y-4">
            {error && <div className="text-red-500">{error}</div>}
            <AudioRecorder
                errorCallback={setError}
                blobCallback={setBlob}
            />
            {transcriptionLoading && <Loading color={HexColors.RED} />}
            {(!transcriptionLoading && transcription) && <ResponseBox label="Transcription" response={transcription} />}
            {(!transcriptionLoading && chatLoading) && <Loading color={HexColors.RED} />}
            {(!transcriptionLoading && !chatLoading && chat) && <ResponseBox label="AI Response" response={chat} />}
        </div>
    )
}
