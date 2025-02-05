import { useState } from "react"
import AudioButton from "./components/AudioButton"
import AudioRecorder from "./components/AudioRecorder"

function App() {
    const [processing, setProcessing] = useState(false)

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <AudioButton processing={processing} setProcessing={setProcessing}></AudioButton>
            <AudioRecorder></AudioRecorder>
        </div>
    )
}

export default App
