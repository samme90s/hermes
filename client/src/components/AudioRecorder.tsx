import { useEffect, useState } from "react"

export default function AudioRecorder() {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recording, setRecording] = useState(false)

    async function getMediaRecorder(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            })
            const options = { mimeType: "audio/webm" }
            const mediaRecorder = new MediaRecorder(stream, options)

            const chunks: Blob[] = []
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data)
            }

            setMediaRecorder(mediaRecorder)
        } catch (err) {
            console.error(`recording error: ${err}`)
        }
    }

    useEffect(() => {
        getMediaRecorder()
    }, [])

    useEffect(() => {
        console.log("recorder set")
    }, [mediaRecorder])

    return <div>AudioRecorderPlaceholder</div>
}
