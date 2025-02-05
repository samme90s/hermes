import { useState } from "react"
import AudioButton from "./components/AudioButton"

function App() {
    const [processing, setProcessing] = useState(false)

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <AudioButton
                processing={processing}
                setProcessing={setProcessing}
            ></AudioButton>
        </div>
    )
}

export default App
